import { spawn } from 'node:child_process';

const python = process.env.PYTHON || 'python';
const isWindows = process.platform === 'win32';
const children = [];
let shuttingDown = false;

function stopChildren(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

const api = spawn(
  python,
  ['-m', 'uvicorn', 'app.main:app', '--app-dir', 'backend', '--host', '127.0.0.1', '--port', '8000', '--reload'],
  { cwd: process.cwd(), stdio: 'inherit' }
);
children.push(api);

const npm = spawn(
  isWindows ? 'npm.cmd' : 'npm',
  ['run', 'dev:frontend'],
  { cwd: process.cwd(), stdio: 'inherit', shell: isWindows }
);
children.push(npm);

api.on('error', (error) => {
  console.error(`Unable to start the academic API with "${python}": ${error.message}`);
  stopChildren(1);
});

npm.on('error', (error) => {
  console.error(`Unable to start the Vite frontend: ${error.message}`);
  stopChildren(1);
});

for (const child of children) {
  child.on('exit', (code) => {
    if (!shuttingDown) stopChildren(code || 0);
  });
}

process.on('SIGINT', () => stopChildren(0));
process.on('SIGTERM', () => stopChildren(0));
