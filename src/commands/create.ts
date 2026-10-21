import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import Listr from 'listr';
import fs from 'fs-extra';
import { databases, features, frameworks, orms, packageManagers } from '../templates/data.js';
import {
  validateProjectName,
  resolveOutputDir,
  checkDirectory,
  createDirectory,
  installProjectDependencies
} from '../utils/index.js';
import { frameworkCommands, addORM, addFeatures, createProjectFromTemplate } from '../utils/frameworks.js';
import { Database, Feature, Framework, ORM, PackageManager, ProjectOptions } from '../types/index.js';

export const createProject = async (name?: string, options?: { directory?: string, template?: string }) => {
  let projectName = name || '';
  if (!projectName) {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is the name of your project?',
          validate: validateProjectName
        }
      ]);
      projectName = answers.projectName;
    } catch (error: any) {
      if (error?.name === 'ExitPromptError') {
        console.log(chalk.yellow('\nOperation cancelled by user.'));
        process.exit(0);
      }
      throw error;
    }
  }

  const projectOptions = await promptForProjectOptions(projectName, options);

  const outputDir = resolveOutputDir(projectName, projectOptions.directory);

  const isEmpty = await checkDirectory(outputDir);
  if (!isEmpty) {
    try {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `Directory ${chalk.cyan(outputDir)} is not empty. Do you want to proceed?`,
          default: false
        }
      ]);

      if (!proceed) {
        console.log(chalk.yellow('Operation cancelled'));
        return;
      }
    } catch (error: any) {
      if (error?.name === 'ExitPromptError') {
        console.log(chalk.yellow('\nOperation cancelled by user.'));
        return;
      }
      throw error;
    }
  }

  await executeProjectCreation(outputDir, projectOptions);

  displaySuccessMessage(outputDir, projectOptions);
};

const promptForProjectOptions = async (
  name: string,
  cliOptions?: { directory?: string, template?: string }
): Promise<ProjectOptions> => {
  try {
    if (cliOptions?.template) {
      return createProjectOptionsFromTemplate(name, cliOptions);
    }

    const { framework } = await inquirer.prompt<{ framework: Framework }>([
      {
        type: 'list',
        name: 'framework',
        message: 'Select a framework:',
        choices: frameworks.map(f => ({ name: `${f.value} - ${f.description}`, value: f.value }))
      }
    ]);

    const { orm } = await inquirer.prompt<{ orm: ORM }>([
      {
        type: 'list',
        name: 'orm',
        message: 'Select an ORM:',
        choices: orms.map(o => ({ name: `${o.value} - ${o.description}`, value: o.value }))
      }
    ]);

    let database: Database = 'none';
    if (orm !== 'none') {
      const answer = await inquirer.prompt<{ database: Database }>([
        {
          type: 'list',
          name: 'database',
          message: 'Select a database:',
          choices: databases.map(d => ({ name: `${d.value} - ${d.description}`, value: d.value }))
        }
      ]);
      database = answer.database;
    }

    const { selectedFeatures } = await inquirer.prompt<{ selectedFeatures: Feature[] }>([
      {
        type: 'checkbox',
        name: 'selectedFeatures',
        message: 'Select features to include:',
        choices: features.map(f => ({
          name: `${f.value} - ${f.description}`,
          value: f.value,
          checked: f.defaultSelected
        }))
      }
    ]);

    const { packageManager } = await inquirer.prompt<{ packageManager: PackageManager }>([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Select a package manager:',
        choices: packageManagers.map(p => ({ name: p.description, value: p.value })),
        default: 'npm'
      }
    ]);

    return {
      name,
      directory: cliOptions?.directory,
      framework,
      orm,
      database,
      features: selectedFeatures,
      packageManager
    };
  } catch (error: any) {
    if (error?.name === 'ExitPromptError') {
      console.log(chalk.yellow('\nOperation cancelled by user.'));
      process.exit(0);
    }
    throw error;
  }
};

const createProjectOptionsFromTemplate = (
  name: string,
  cliOptions: { directory?: string, template?: string }
): ProjectOptions => {
  const template = cliOptions.template!;
  const framework = template.replace(/-typescript$/, '') as Framework;

  if (!frameworks.some(f => f.value === framework)) {
    throw new Error(`Invalid template: ${template}. Available: ${frameworks.map(f => `${f.value}-typescript`).join(', ')}`);
  }

  return {
    name,
    directory: cliOptions.directory,
    framework,
    orm: 'none',
    database: 'none',
    features: features.filter(f => f.defaultSelected).map(f => f.value),
    packageManager: 'npm'
  };
};

const executeProjectCreation = async (outputDir: string, options: ProjectOptions) => {
  const tasks = new Listr([
    {
      title: 'Creating project directory',
      task: async () => {
        if (options.framework !== 'nestjs') {
          await createDirectory(outputDir);
        }
      }
    },
    {
      title: `Creating ${options.framework} project`,
      task: async () => {
        if (options.framework === 'nestjs') {
          const success = await frameworkCommands.nestjs.create(outputDir, options);
          if (!success) {
            throw new Error('Failed to create nestjs project using official CLI');
          }
        } else {
          const success = await createProjectFromTemplate(outputDir, options);
          if (!success) {
            throw new Error(`Failed to create ${options.framework} project from template`);
          }
        }
      }
    },
    {
      title: `Adding ${options.orm === 'none' ? 'no ORM' : options.orm} to the project`,
      task: async () => {
        if (options.orm !== 'none') {
          const success = await addORM(outputDir, options);
          if (!success) {
            throw new Error(`Failed to add ORM ${options.orm}`);
          }
        }
      }
    },
    {
      title: 'Adding selected features',
      task: async () => {
        const success = await addFeatures(outputDir, options);
        if (!success) {
          throw new Error('Failed to add features');
        }
      }
    },
    {
      title: 'Creating configuration files',
      task: async () => {
        const envContent = `NODE_ENV=development
PORT=3000
${options.database !== 'none' ? `DATABASE_URL=${getDatabaseUrl(options.database)}\n` : ''}`;
        await fs.writeFile(path.join(outputDir, '.env'), envContent);
        await fs.writeFile(path.join(outputDir, '.env.example'), envContent);

        if (options.features.includes('docker')) {
          const install = options.packageManager === 'npm' ? 'npm ci' : 'pnpm install --frozen-lockfile';
          const build = options.packageManager === 'npm' ? 'npm run build' : 'pnpm build';
          const dockerfileContent = `FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN ${install}

COPY . .
RUN ${build}

EXPOSE 3000

CMD ["node", "dist/index.js"]
`;
          await fs.writeFile(path.join(outputDir, 'Dockerfile'), dockerfileContent);

          const dockerComposeContent = `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
${options.database === 'postgresql' ? `    depends_on:
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
          await fs.writeFile(path.join(outputDir, 'docker-compose.yml'), dockerComposeContent);
        }
      }
    },
    {
      title: `Installing dependencies with ${options.packageManager}`,
      task: async () => {
        if (options.framework !== 'nestjs') {
          await installProjectDependencies(outputDir, options.packageManager);
        }
      }
    }
  ]);

  await tasks.run();
};

const displaySuccessMessage = (outputDir: string, options: ProjectOptions) => {
  const runCommand = options.packageManager === 'pnpm' ? 'pnpm' : 'npm run';

  console.log();
  console.log(chalk.green('✨ Project created successfully!'));
  console.log();
  console.log(`${chalk.bold('Next steps:')}`);
  console.log(`  cd ${chalk.cyan(path.relative(process.cwd(), outputDir))}`);
  console.log(`  ${chalk.cyan(`${runCommand} dev`)}`);

  if (options.database === 'postgresql' && options.features.includes('docker')) {
    console.log(`  ${chalk.cyan('docker compose up -d')}`);
  }

  console.log();
  console.log(`To learn more about Aspen, visit: ${chalk.cyan('https://github.com/mateuscastro5/aspen')}`);
  console.log();
};

const getDatabaseUrl = (database: Database): string => {
  switch (database) {
    case 'postgresql':
      return 'postgresql://postgres:postgres@localhost:5432/app';
    case 'sqlite':
      return 'file:./dev.db';
    default:
      return '';
  }
};
