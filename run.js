const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('================================================================');
console.log('  Starting University Complaint Management System (UCMS)...     ');
console.log('================================================================');

// 1. Start Server
const serverProcess = spawn(npmCmd, ['start'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nStopping UCMS services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
