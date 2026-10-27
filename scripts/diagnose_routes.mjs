import { spawn } from 'child_process';
import http from 'http';

async function diagnose() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9333;
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    'about:blank'
  ]);
  
  await new Promise(r => setTimeout(r, 1500));
  
  const getPages = () => new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json/list`, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => resolve(JSON.parse(b)));
    }).on('error', reject);
  });
  
  const pages = await getPages();
  const page = pages.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  
  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = msgId++;
    const handler = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
  
  ws.onopen = async () => {
    await send('Runtime.enable');
    await send('Page.enable');
    
    ws.addEventListener('message', (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        console.log(`CONSOLE [${data.params.type}]: ${text}`);
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
      }
    });
    
    const testRoutes = [
      'http://localhost:5173/admin/login',
      'http://localhost:5173/admin/dashboard',
      'http://localhost:5173/admin/students',
      'http://localhost:5173/faculty/login',
      'http://localhost:5173/faculty/dashboard',
      'http://localhost:5173/faculty/students',
      'http://localhost:5173/student/login',
      'http://localhost:5173/student/dashboard',
      'http://localhost:5173/student/results'
    ];
    
    for (const url of testRoutes) {
      console.log(`\n========================================`);
      console.log(`NAVIGATING TO: ${url}`);
      console.log(`========================================`);
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 2000));
      const res = await send('Runtime.evaluate', {
        expression: 'document.querySelector("#root") ? document.querySelector("#root").innerHTML : "NO #ROOT FOUND"'
      });
      const html = res.result?.value || '';
      console.log(`ROOT HTML snippet (total length ${html.length}):\n${html.substring(0, 180)}...`);
    }
    
    chrome.kill();
    process.exit(0);
  };
}

diagnose().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
