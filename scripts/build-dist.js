import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const copyTargets = [
  '_worker.js',
  'worker.js',
  '_routes.json',
  'index.html',
  'read.html',
  'css',
  'js',
  'data',
  'shared'
];

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyTarget(targetRelPath) {
  const srcPath = path.join(projectRoot, targetRelPath);
  const dstPath = path.join(distDir, targetRelPath);

  if (!(await pathExists(srcPath))) {
    console.warn(`[build:dist] skip missing: ${targetRelPath}`);
    return;
  }

  const st = await fs.stat(srcPath);

  if (st.isDirectory()) {
    await fs.cp(srcPath, dstPath, { recursive: true });
    return;
  }

  await fs.mkdir(path.dirname(dstPath), { recursive: true });
  await fs.copyFile(srcPath, dstPath);
}

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });

await Promise.all(copyTargets.map(copyTarget));

console.log('[build:dist] done');
