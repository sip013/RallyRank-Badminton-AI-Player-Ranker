import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serveCli = require.resolve('serve/build/main.js');
const port = process.env.PORT || '3000';

const child = spawn(
  process.execPath,
  [serveCli, '-s', 'dist', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit' }
);

child.on('exit', (code) => process.exit(code ?? 1));
