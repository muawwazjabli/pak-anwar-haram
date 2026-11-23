const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const localBin = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');
const fallbackModules = 'C:\\Users\\jabli\\.gemini\\web_node_modules\\node_modules';
const fallbackBin = path.join(fallbackModules, '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');

const binToUse = fs.existsSync(localBin) ? localBin : (fs.existsSync(fallbackBin) ? fallbackBin : 'next');

const nodePathEnv = [
  process.env.NODE_PATH,
  path.join(__dirname, '..', 'node_modules'),
  fallbackModules
].filter(Boolean).join(path.delimiter);

const env = {
  ...process.env,
  NODE_PATH: nodePathEnv
};

const args = process.argv.slice(2);
console.log(`[Pak Anwar Haram] Invoking Next.js CLI: ${binToUse} ${args.join(' ')}`);

const child = spawn(binToUse, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
