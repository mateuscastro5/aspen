#!/usr/bin/env node

import { Command } from 'commander';
import gradient from 'gradient-string';
import { createProject } from './commands/create.js';
import { listTemplates } from './commands/list.js';
import { checkForUpdates } from './utils/updates.js';
import pkg from '../package.json' with { type: 'json' };

const version = pkg.version;

// Create a beautiful gradient for our CLI header
const aspenGradient = gradient(['#2ecc71', '#3498db', '#9b59b6']);

// Initialize the CLI program
const program = new Command();

console.log(aspenGradient.multiline(`
     /\\      
    /  \\     ███████╗██████╗ ███████╗███╗   ██╗
   /    \\    ██╔════╝██╔══██╗██╔════╝████╗  ██║
  /      \\   ███████╗██████╔╝█████╗  ██╔██╗ ██║
 /        \\  ╚════██║██╔═══╝ ██╔══╝  ██║╚██╗██║
/          \\ ███████║██║     ███████╗██║ ╚████║
────────────╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝
                                                
  🌲 Modern Backend Project Scaffolding Tool 🌲
`));

program
  .name('aspen')
  .description('A modern CLI tool for creating backend projects')
  .version(version);

// Create new project command
program
  .command('create')
  .description('Create a new backend project')
  .argument('[name]', 'Name of the project')
  .option('-d, --directory <directory>', 'Directory to create the project in')
  .option('-t, --template <template>', 'Template to use')
  .action(createProject);

// List available templates
program
  .command('list')
  .description('List available templates and frameworks')
  .action(listTemplates);

// Parse the command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// Check for updates
checkForUpdates();
