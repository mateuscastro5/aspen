#!/usr/bin/env node
import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { listTemplates } from './commands/list.js';
import pkg from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('aspen')
  .description('A modern CLI tool for creating backend projects')
  .version(pkg.version);

program
  .command('create')
  .description('Create a new backend project')
  .argument('[name]', 'Name of the project')
  .option('-f, --framework <framework>', 'express, fastify or nestjs')
  .option('-o, --orm <orm>', 'prisma, drizzle or none')
  .option('--database <database>', 'postgresql or sqlite (requires an ORM)')
  .option('--features <features>', 'comma-separated: docker,lint,test,swagger,cors,helmet (or "none")')
  .option('-p, --package-manager <packageManager>', 'npm or pnpm')
  .option('-d, --directory <directory>', 'Parent directory for the project')
  .option('-t, --template <template>', 'Legacy shortcut, e.g. express-typescript')
  .option('-y, --yes', 'Use defaults for anything not provided, without prompts')
  .option('--no-install', 'Skip installing dependencies')
  .option('--json', 'Machine-readable output (implies --yes)')
  .action(createProject);

program
  .command('list')
  .description('List supported frameworks, ORMs, databases and features')
  .option('--json', 'Machine-readable output')
  .action(listTemplates);

program.parse(process.argv);
