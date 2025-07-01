import { Command } from 'commander';
import gradient from 'gradient-string';
import { createProject } from './commands/create.js';
import { listTemplates } from './commands/list.js';
import pkg from '../package.json' with { type: 'json' };

const version = pkg.version;

const aspenGradient = gradient(['#2ecc71', '#3498db', '#9b59b6']);

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

program
  .command('create')
  .description('Create a new backend project')
  .argument('[name]', 'Name of the project')
  .option('-d, --directory <directory>', 'Directory to create the project in')
  .option('-t, --template <template>', 'Template to use')
  .action(createProject);

program
  .command('list')
  .description('List available templates and frameworks')
  .action(listTemplates);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
