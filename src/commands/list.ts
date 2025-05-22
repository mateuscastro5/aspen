import chalk from 'chalk';
import { templates } from '../templates/data.js';

export const listTemplates = () => {
  console.log(chalk.bold('\nAvailable templates:'));
  console.log(chalk.dim('------------------'));
  
  templates.forEach(template => {
    console.log(`\n${chalk.cyan(template.name)} - ${template.description}`);
    
    console.log(chalk.bold('\n  Frameworks:'));
    template.frameworks.forEach(framework => {
      console.log(`  • ${chalk.green(framework.name)} - ${framework.description}`);
    });
  });
  
  console.log('\nUse these templates with the create command:');
  console.log(`  ${chalk.cyan('aspen create my-project -t typescript')}`);
  console.log();
};

export default listTemplates;
