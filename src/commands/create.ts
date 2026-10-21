import inquirer from 'inquirer';
import chalk from 'chalk';
import { databases, features, frameworks, orms, packageManagers } from '../templates/data.js';
import { CreateInput, OptionsError, resolveOptions, validateProjectName } from '../core/options.js';
import { GenerationError, generateProject, isDirectoryEmpty, resolveProjectDir } from '../core/generator.js';
import { createLogger } from '../core/logger.js';
import { printBanner } from '../utils/banner.js';

export interface CreateFlags {
  directory?: string;
  framework?: string;
  orm?: string;
  database?: string;
  features?: string;
  packageManager?: string;
  template?: string;
  yes?: boolean;
  install?: boolean;
  json?: boolean;
}

const promptMissing = async (input: CreateInput): Promise<CreateInput> => {
  const answers = { ...input };

  if (!answers.name) {
    ({ name: answers.name } = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'What is the name of your project?', validate: validateProjectName }
    ]));
  }

  if (!answers.framework && !answers.template) {
    ({ framework: answers.framework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Select a framework:',
        choices: frameworks.map(f => ({ name: `${f.value} - ${f.description}`, value: f.value }))
      }
    ]));
  }

  if (!answers.orm) {
    ({ orm: answers.orm } = await inquirer.prompt([
      {
        type: 'list',
        name: 'orm',
        message: 'Select an ORM:',
        choices: orms.map(o => ({ name: `${o.value} - ${o.description}`, value: o.value }))
      }
    ]));
  }

  if (!answers.database && answers.orm !== 'none') {
    ({ database: answers.database } = await inquirer.prompt([
      {
        type: 'list',
        name: 'database',
        message: 'Select a database:',
        choices: databases.map(d => ({ name: `${d.value} - ${d.description}`, value: d.value }))
      }
    ]));
  }

  if (answers.features === undefined) {
    const { selected } = await inquirer.prompt<{ selected: string[] }>([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Select features to include:',
        choices: features.map(f => ({ name: `${f.value} - ${f.description}`, value: f.value, checked: f.defaultSelected }))
      }
    ]);
    answers.features = selected.length ? selected.join(',') : 'none';
  }

  if (!answers.packageManager) {
    ({ packageManager: answers.packageManager } = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Select a package manager:',
        choices: packageManagers.map(p => ({ name: p.description, value: p.value })),
        default: 'npm'
      }
    ]));
  }

  return answers;
};

const fail = (error: unknown, json: boolean): never => {
  const message = error instanceof Error ? error.message : String(error);
  const detail = error instanceof GenerationError ? error.detail : undefined;

  if (json) {
    process.stdout.write(`${JSON.stringify({ ok: false, error: message, ...(detail && { detail }) }, null, 2)}\n`);
  } else {
    console.error(chalk.red(`\n✖ ${message}`));
    if (detail) {
      console.error(chalk.dim(detail));
    }
  }
  process.exit(1);
};

export const createProject = async (name: string | undefined, flags: CreateFlags) => {
  const json = Boolean(flags.json);
  const interactive = !json && !flags.yes && Boolean(process.stdin.isTTY);

  if (interactive) {
    printBanner();
  }

  let input: CreateInput = {
    name,
    directory: flags.directory,
    framework: flags.framework,
    orm: flags.orm,
    database: flags.database,
    features: flags.features,
    packageManager: flags.packageManager,
    template: flags.template
  };

  try {
    if (interactive) {
      input = await promptMissing(input);
    } else if (!input.name) {
      throw new OptionsError('Project name is required when running without prompts. Usage: aspen create <name> --yes');
    }

    const options = resolveOptions(input);
    const dir = resolveProjectDir(options);

    if (!await isDirectoryEmpty(dir)) {
      throw new OptionsError(`Directory ${dir} is not empty`);
    }

    const result = await generateProject(options, {
      install: flags.install !== false,
      logger: createLogger(json)
    });

    if (json) {
      process.stdout.write(`${JSON.stringify({ ok: true, ...result }, null, 2)}\n`);
      return;
    }

    console.log(chalk.green('\n✨ Project created successfully!\n'));
    console.log(chalk.bold('Next steps:'));
    result.nextSteps.forEach(step => console.log(`  ${chalk.cyan(step)}`));
    console.log();
  } catch (error: any) {
    if (error?.name === 'ExitPromptError') {
      console.log(chalk.yellow('\nOperation cancelled by user.'));
      process.exit(0);
    }
    fail(error, json);
  }
};
