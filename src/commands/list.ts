import chalk from 'chalk';
import { databases, features, frameworks, orms, packageManagers } from '../templates/data.js';
import { Choice } from '../types/index.js';

const printGroup = <T extends string>(title: string, choices: Choice<T>[]) => {
  console.log(chalk.bold(`\n${title}:`));
  choices.forEach(choice => {
    console.log(`  • ${chalk.green(choice.value)} - ${choice.description}`);
  });
};

export const listTemplates = (flags: { json?: boolean } = {}) => {
  if (flags.json) {
    process.stdout.write(`${JSON.stringify({ frameworks, orms, databases, features, packageManagers }, null, 2)}\n`);
    return;
  }

  printGroup('Frameworks', frameworks);
  printGroup('ORMs', orms);
  printGroup('Databases', databases);
  printGroup('Features', features);
  printGroup('Package managers', packageManagers);

  console.log('\nCreate a project with:');
  console.log(`  ${chalk.cyan('aspen create my-api')}`);
  console.log(`  ${chalk.cyan('aspen create my-api --framework fastify --orm drizzle --database postgresql --yes')}`);
  console.log();
};

export default listTemplates;
