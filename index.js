import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.resolve(__dirname, 'server/index.ts');
const tsxCli = path.resolve(__dirname, 'node_modules/tsx/dist/cli.mjs');

console.log('[WINDERVALE] Launching server from index.js wrapper...');
console.log(`[WINDERVALE] Node binary: ${process.execPath}`);
console.log(`[WINDERVALE] tsx CLI: ${tsxCli}`);
console.log(`[WINDERVALE] Server script: ${serverPath}`);
console.log(`[WINDERVALE] PORT: ${process.env.PORT || 3001}`);

if (!fs.existsSync(serverPath)) {
  console.error(`[WINDERVALE FATAL] Server entrypoint not found at: ${serverPath}`);
  process.exit(1);
}

// If local tsx cli exists, invoke it via node directly without subshell
let child;
if (fs.existsSync(tsxCli)) {
  child = spawn(process.execPath, [tsxCli, serverPath], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
} else {
  // Fallback to npx tsx without shell option
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  child = spawn(cmd, ['tsx', serverPath], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
}

child.on('exit', (code) => {
  console.log(`[WINDERVALE] Child process exited with code ${code}`);
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('[WINDERVALE FATAL] Failed to spawn server process:', err);
  process.exit(1);
});
