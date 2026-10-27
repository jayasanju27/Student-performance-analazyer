const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9222;
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    'about:blank'
  ]);

  // wait 1 second for Chrome to start
  await new Promise(r => setTimeout(r, 1500));

  function getJson(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${path}`, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
  }

  try {
    const pages = await getJson('/json/list');
    console.log('Available pages in Chrome:', pages.length);
    const wsUrl = pages[0].webSocketDebuggerUrl;
    console.log('Debugger URL:', wsUrl);
  } catch (err) {
    console.error('Error contacting Chrome debug port:', err.message);
  } finally {
    chrome.kill();
  }
}

main();
