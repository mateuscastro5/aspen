import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import { execa } from 'execa';
import { fileURLToPath } from 'url';
import { Feature, ProjectOptions } from '../types/index.js';
import { getDependencyPlan } from './dependencies.js';
import { versions } from './versions.js';
import { Logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, '../../templates');

export interface GenerateSettings {
  install: boolean;
  logger: Logger;
}

export interface GenerateResult {
  directory: string;
  options: ProjectOptions;
  installed: boolean;
  nextSteps: string[];
}

export class GenerationError extends Error {
  constructor(message: string, readonly detail?: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

export const resolveProjectDir = (options: ProjectOptions): string =>
  path.resolve(options.directory ?? process.cwd(), options.name);

export const isDirectoryEmpty = async (dir: string): Promise<boolean> => {
  if (!await fs.pathExists(dir)) {
    return true;
  }
  return (await fs.readdir(dir)).length === 0;
};

const run = async (command: string, args: string[], cwd: string) => {
  try {
    await execa(command, args, { cwd, stdio: 'pipe', timeout: 600000 });
  } catch (error: any) {
    throw new GenerationError(`Command failed: ${command} ${args.join(' ')}`, error.stderr || error.stdout || error.message);
  }
};

const renderTemplate = async (sourceDir: string, targetDir: string, options: ProjectOptions) => {
  const data = {
    options,
    has: (feature: Feature) => options.features.includes(feature),
    ext: '.js'
  };

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetName = entry.name.replace(/\.ejs$/, '').replace(/^_gitignore$/, '.gitignore');
    const targetPath = path.join(targetDir, targetName);

    if (entry.isDirectory()) {
      await fs.ensureDir(targetPath);
      await renderTemplate(sourcePath, targetPath, options);
    } else if (entry.name.endsWith('.ejs')) {
      const rendered = ejs.render(await fs.readFile(sourcePath, 'utf8'), data);
      if (rendered.trim().length > 0) {
        await fs.writeFile(targetPath, rendered);
      }
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
};

const scaffoldFromTemplate = async (dir: string, options: ProjectOptions) => {
  const templateDir = path.join(templatesDir, `${options.framework}-typescript`);
  if (!await fs.pathExists(templateDir)) {
    throw new GenerationError(`No template available for ${options.framework}`);
  }
  await fs.ensureDir(dir);
  await renderTemplate(path.join(templatesDir, 'shared'), dir, options);
  await renderTemplate(templateDir, dir, options);
};

const scaffoldNest = async (dir: string, options: ProjectOptions) => {
  await fs.ensureDir(path.dirname(dir));
  await run('npx', [
    '--yes',
    `@nestjs/cli@${versions['@nestjs/cli']}`,
    'new',
    options.name,
    '--package-manager',
    options.packageManager,
    '--skip-git',
    '--skip-install'
  ], path.dirname(dir));
  await renderTemplate(path.join(templatesDir, 'nestjs'), dir, options);
};

const addOrmFiles = async (dir: string, options: ProjectOptions) => {
  if (options.orm !== 'none') {
    await renderTemplate(path.join(templatesDir, 'orm', options.orm), dir, options);
  }
};

const ormScripts = (options: ProjectOptions): Record<string, string> => {
  if (options.orm === 'prisma') {
    return { 'db:generate': 'prisma generate', 'db:migrate': 'prisma migrate dev', 'db:studio': 'prisma studio' };
  }
  if (options.orm === 'drizzle') {
    return { 'db:generate': 'drizzle-kit generate', 'db:migrate': 'drizzle-kit migrate', 'db:studio': 'drizzle-kit studio' };
  }
  return {};
};

const writePackageJson = async (dir: string, options: ProjectOptions) => {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  const plan = getDependencyPlan(options);

  packageJson.name = options.name;

  const prismaGenerate = options.orm === 'prisma' ? 'prisma generate && ' : '';

  if (options.framework === 'nestjs') {
    packageJson.dependencies = { ...packageJson.dependencies, ...plan.dependencies };
    packageJson.devDependencies = { ...packageJson.devDependencies, ...plan.devDependencies };
    packageJson.scripts = {
      ...packageJson.scripts,
      build: `${prismaGenerate}${packageJson.scripts?.build ?? 'nest build'}`,
      ...ormScripts(options)
    };
  } else {
    packageJson.dependencies = plan.dependencies;
    packageJson.devDependencies = plan.devDependencies;
    packageJson.scripts = {
      build: `${prismaGenerate}tsc`,
      dev: 'tsx watch src/index.ts',
      start: 'node dist/index.js',
      ...(options.features.includes('lint') && { lint: 'eslint src', format: 'prettier --write src' }),
      ...(options.features.includes('test') && { test: 'vitest run' }),
      ...ormScripts(options)
    };
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
};

const databaseUrl = (options: ProjectOptions): string =>
  options.database === 'sqlite' ? 'file:./dev.db' : 'postgresql://postgres:postgres@localhost:5432/app';

const writeEnvFiles = async (dir: string, options: ProjectOptions) => {
  const lines = ['NODE_ENV=development', 'PORT=3000'];
  if (options.database !== 'none') {
    lines.push(`DATABASE_URL=${databaseUrl(options)}`);
  }
  const content = `${lines.join('\n')}\n`;
  await fs.writeFile(path.join(dir, '.env'), content);
  await fs.writeFile(path.join(dir, '.env.example'), content);
};

const writePnpmWorkspace = async (dir: string) => {
  const file = path.join(dir, 'pnpm-workspace.yaml');
  if (await fs.pathExists(file)) {
    return;
  }
  await fs.writeFile(file, `allowBuilds:
  esbuild: true
  prisma: true
  '@prisma/engines': true
  '@scarf/scarf': false
`);
};

const writeDockerFiles = async (dir: string, options: ProjectOptions) => {
  const npm = options.packageManager === 'npm';
  const dockerfile = `FROM node:24-alpine AS build
WORKDIR /app
${npm ? '' : 'RUN corepack enable\n'}COPY package.json ${npm ? 'package-lock.json' : 'pnpm-lock.yaml pnpm-workspace.yaml'} ./
RUN ${npm ? 'npm ci' : 'pnpm install --frozen-lockfile'}
COPY . .
RUN ${npm ? 'npm run build' : 'pnpm build'}

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "${options.framework === 'nestjs' ? 'dist/main.js' : 'dist/index.js'}"]
`;

  const postgres = options.database === 'postgresql';
  const compose = `services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
${postgres ? `    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgresql:5432/app
    depends_on:
      - postgresql

  postgresql:
    image: postgres:17
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    ports:
      - "5432:5432"
    volumes:
      - postgresql-data:/var/lib/postgresql/data

volumes:
  postgresql-data:
` : ''}`;

  await fs.writeFile(path.join(dir, 'Dockerfile'), dockerfile);
  await fs.writeFile(path.join(dir, 'docker-compose.yml'), compose);
  await fs.writeFile(path.join(dir, '.dockerignore'), 'node_modules\ndist\n.env\n');
};

const nextSteps = (dir: string, options: ProjectOptions, installed: boolean): string[] => {
  const pm = options.packageManager;
  const steps = [`cd ${path.relative(process.cwd(), dir) || '.'}`];
  if (!installed) {
    steps.push(`${pm} install`);
  }
  if (options.database === 'postgresql' && options.features.includes('docker')) {
    steps.push('docker compose up -d postgresql');
  }
  steps.push(options.framework === 'nestjs' ? `${pm} run start:dev` : `${pm} run dev`);
  return steps;
};

export const generateProject = async (options: ProjectOptions, settings: GenerateSettings): Promise<GenerateResult> => {
  const dir = resolveProjectDir(options);
  const { logger } = settings;

  if (!await isDirectoryEmpty(dir)) {
    throw new GenerationError(`Directory ${dir} is not empty`);
  }

  await logger.step(`Creating ${options.framework} project`, () =>
    options.framework === 'nestjs' ? scaffoldNest(dir, options) : scaffoldFromTemplate(dir, options)
  );

  await logger.step('Writing dependencies and configuration', async () => {
    await addOrmFiles(dir, options);
    await writePackageJson(dir, options);
    await writeEnvFiles(dir, options);
    if (options.packageManager === 'pnpm') {
      await writePnpmWorkspace(dir);
    }
    if (options.features.includes('docker')) {
      await writeDockerFiles(dir, options);
    }
  });

  if (settings.install) {
    await logger.step(`Installing dependencies with ${options.packageManager}`, () =>
      run(options.packageManager, ['install'], dir)
    );
  }

  return {
    directory: dir,
    options,
    installed: settings.install,
    nextSteps: nextSteps(dir, options, settings.install)
  };
};
