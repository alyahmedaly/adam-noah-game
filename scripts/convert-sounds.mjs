import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

async function findM4AFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findM4AFiles(fullPath);
      }

      return fullPath.endsWith('.m4a') ? [fullPath] : [];
    })
  );

  return files.flat();
}

function convertFile(inputPath) {
  const outputPath = inputPath.replace(/\.m4a$/i, '.wav');

  return new Promise((resolve, reject) => {
    const child = spawn(
      'ffmpeg',
      ['-y', '-i', inputPath, '-ac', '1', '-ar', '44100', outputPath],
      { stdio: 'inherit' }
    );

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(outputPath);
        return;
      }

      reject(new Error(`ffmpeg failed for ${inputPath} with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

const soundRoot = path.resolve('sounds');
const inputs = await findM4AFiles(soundRoot);

for (const inputPath of inputs) {
  console.log(`Converting ${path.relative(process.cwd(), inputPath)}`);
  await convertFile(inputPath);
}
