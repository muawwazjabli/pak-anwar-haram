const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const fallbackModules = 'C:\\Users\\jabli\\.gemini\\web_node_modules\\node_modules';
const tsxCli = path.join(fallbackModules, 'tsx', 'dist', 'cli.mjs');

const nodePathEnv = [
  process.env.NODE_PATH,
  path.join(__dirname, '..', 'node_modules'),
  fallbackModules
].filter(Boolean).join(path.delimiter);

const env = {
  ...process.env,
  NODE_PATH: nodePathEnv
};

const testFile = path.join(__dirname, 'run-acceptance-cli.ts');

fs.writeFileSync(testFile, `
import { runAcceptanceTests } from '../src/test/acceptance-tests';

runAcceptanceTests().then(res => {
  if (res.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch(err => {
  console.error('Test Runner Error:', err);
  process.exit(1);
});
`);

// Run node directly with tsxCli and testFile
const child = spawn(process.execPath, [tsxCli, testFile], {
  stdio: 'inherit',
  shell: false,
  env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
