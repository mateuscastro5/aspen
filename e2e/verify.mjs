import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const framework = process.env.FRAMEWORK ?? 'express';
const orm = process.env.ORM ?? 'none';
const database = process.env.DATABASE ?? 'none';
const pm = process.env.PM ?? 'npm';
const port = Number(process.env.PORT ?? 4310);
const name = `e2e-${framework}-${orm}-${database}-${pm}`;
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'aspen-e2e-'));
const projectDir = path.join(workspace, name);
const shell = process.platform === 'win32';

const step = (title, command, args, cwd, useShell = shell) => {
  console.log(`\n▶ ${title}: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: useShell });
  if (result.status !== 0) {
    throw new Error(`${title} failed with exit code ${result.status}`);
  }
};

const waitFor = async (url, timeoutMs = 30000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      return response;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Server did not respond at ${url}`);
};

const createArgs = [path.join(root, 'dist', 'index.js'), 'create', name, '--framework', framework, '--package-manager', pm, '--directory', workspace, '--json'];
if (orm !== 'none') {
  createArgs.push('--orm', orm, '--database', database);
}

let server;
try {
  step('create', process.execPath, createArgs, workspace, false);
  step('build', pm, ['run', 'build'], projectDir);
  step('test', pm, ['test'], projectDir);
  step('lint', pm, ['run', 'lint'], projectDir);

  const entry = framework === 'nestjs' ? 'dist/main.js' : 'dist/index.js';
  console.log(`\n▶ start: node ${entry}`);
  server = spawn(process.execPath, [entry], { cwd: projectDir, env: { ...process.env, PORT: String(port) }, stdio: 'inherit' });

  const healthPath = framework === 'nestjs' ? '/' : '/health';
  const health = await waitFor(`http://127.0.0.1:${port}${healthPath}`);
  if (health.status !== 200) {
    throw new Error(`${healthPath} returned ${health.status}`);
  }
  if (!health.headers.get('x-content-type-options')) {
    throw new Error('Helmet headers are missing');
  }
  if (health.headers.get('access-control-allow-origin') !== '*') {
    throw new Error('CORS header is missing');
  }

  const docs = await fetch(`http://127.0.0.1:${port}/docs`);
  if (docs.status !== 200) {
    throw new Error(`/docs returned ${docs.status}`);
  }

  console.log(`\n✔ ${name} passed`);
} catch (error) {
  console.error(`\n✖ ${name}: ${error.message}`);
  process.exitCode = 1;
} finally {
  server?.kill();
  fs.rmSync(workspace, { recursive: true, force: true, maxRetries: 3 });
}
