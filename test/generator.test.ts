import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generateProject } from '../src/core/generator.js';
import { createLogger } from '../src/core/logger.js';
import { defaultFeatures } from '../src/core/options.js';
import { Database, Framework, ORM, ProjectOptions } from '../src/types/index.js';

let workspace: string;

beforeAll(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'aspen-test-'));
});

afterAll(async () => {
  await fs.remove(workspace);
});

const generate = async (overrides: Partial<ProjectOptions>) => {
  const options: ProjectOptions = {
    name: `p${Math.random().toString(36).slice(2, 8)}`,
    directory: workspace,
    framework: 'express',
    orm: 'none',
    database: 'none',
    features: defaultFeatures(),
    packageManager: 'npm',
    ...overrides,
  };
  const result = await generateProject(options, { install: false, logger: createLogger(true) });
  const exists = (file: string) => fs.pathExists(path.join(result.directory, file));
  const read = (file: string) => fs.readFile(path.join(result.directory, file), 'utf8');
  return { result, exists, read };
};

const combos: [Framework, ORM, Database][] = [];
for (const framework of ['express', 'fastify'] as Framework[]) {
  combos.push([framework, 'none', 'none']);
  for (const orm of ['prisma', 'drizzle'] as ORM[]) {
    for (const database of ['postgresql', 'sqlite'] as Database[]) {
      combos.push([framework, orm, database]);
    }
  }
}

describe('generateProject', () => {
  it.each(combos)('generates %s with %s and %s', async (framework, orm, database) => {
    const { exists, read } = await generate({ framework, orm, database });

    expect(await exists('src/app.ts')).toBe(true);
    expect(await exists('src/index.ts')).toBe(true);
    expect(await exists('.gitignore')).toBe(true);
    expect(await exists('src/db/client.ts')).toBe(orm !== 'none');
    expect(await exists('prisma/schema.prisma')).toBe(orm === 'prisma');
    expect(await exists('drizzle.config.ts')).toBe(orm === 'drizzle');

    const env = await read('.env');
    expect(env.includes('DATABASE_URL')).toBe(database !== 'none');

    const pkg = JSON.parse(await read('package.json'));
    expect(pkg.scripts.build).toBe(orm === 'prisma' ? 'prisma generate && tsc' : 'tsc');
  });

  it('leaves out files for features that were not selected', async () => {
    const { exists, read } = await generate({ features: [] });

    expect(await exists('src/openapi.ts')).toBe(false);
    expect(await exists('src/app.test.ts')).toBe(false);
    expect(await exists('eslint.config.js')).toBe(false);
    expect(await exists('Dockerfile')).toBe(false);

    const app = await read('src/app.ts');
    expect(app).not.toContain('helmet');
    expect(app).not.toContain('cors');
  });

  it('wires every selected feature', async () => {
    const { exists, read } = await generate({ features: defaultFeatures() });

    expect(await exists('src/openapi.ts')).toBe(true);
    expect(await exists('src/app.test.ts')).toBe(true);
    expect(await exists('eslint.config.js')).toBe(true);
    expect(await exists('Dockerfile')).toBe(true);

    const app = await read('src/app.ts');
    expect(app).toContain('app.use(helmet())');
    expect(app).toContain('app.use(cors())');
    expect(app).toContain("app.use('/docs'");
  });

  it('adds PostgreSQL to docker-compose only when it is the database', async () => {
    const withPostgres = await generate({ orm: 'drizzle', database: 'postgresql' });
    const withSqlite = await generate({ orm: 'drizzle', database: 'sqlite' });

    expect(await withPostgres.read('docker-compose.yml')).toContain('postgres:17');
    expect(await withSqlite.read('docker-compose.yml')).not.toContain('postgres');
  });

  it('uses pnpm in the Dockerfile when selected', async () => {
    const { read } = await generate({ packageManager: 'pnpm' });

    expect(await read('Dockerfile')).toContain('pnpm install --frozen-lockfile');
  });

  it('refuses to write into a non-empty directory', async () => {
    const name = 'not-empty';
    await fs.outputFile(path.join(workspace, name, 'keep.txt'), 'x');

    await expect(generate({ name })).rejects.toThrow(/not empty/);
  });
});
