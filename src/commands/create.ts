import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import Listr from 'listr';
import fs from 'fs-extra';
import { features, templates } from '../templates/data.js';
import { 
  validateProjectName, 
  resolveOutputDir, 
  checkDirectory,
  createDirectory
} from '../utils/index.js';
import { frameworkCommands, addORM, addFeatures, createProjectFromTemplate } from '../utils/frameworks.js';
import { ProjectOptions } from '../types/index.js';

export const createProject = async (name?: string, options?: { directory?: string, template?: string }) => {
  let projectName = name || '';
  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        validate: validateProjectName
      }
    ]);
    projectName = answers.projectName;
  }

  const projectOptions = await promptForProjectOptions(projectName, options);
  
  const outputDir = resolveOutputDir(projectName, projectOptions.directory);
  
  const isEmpty = await checkDirectory(outputDir);
  if (!isEmpty) {
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
  }
  
  await executeProjectCreation(outputDir, projectOptions);
  
  displaySuccessMessage(outputDir, projectOptions);
};

const promptForProjectOptions = async (
  name: string, 
  cliOptions?: { directory?: string, template?: string }
): Promise<ProjectOptions> => {
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select the programming language:',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description}`,
        value: t.name
      }))
    }
  ]);
  
  const selectedTemplate = templates.find(t => t.name === language);
  if (!selectedTemplate) {
    throw new Error(`Template '${language}' not found`);
  }
  
  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Select a framework:',
      choices: [
        ...selectedTemplate.frameworks.map(f => ({
          name: `${f.name} - ${f.description}`,
          value: f.name
        })),
        { name: 'hono - Ultrafast web framework for the Edges', value: 'hono' },
        { name: 'adonisjs - Full-stack framework with a focus on developer ergonomics', value: 'adonisjs' }
      ]
    }
  ]);
  
  const selectedFramework = selectedTemplate.frameworks.find(f => f.name === framework);
  
  let ormChoices;
  
  if (framework === 'hono') {
    ormChoices = [
      { name: 'prisma - Next-generation ORM for Node.js and TypeScript', value: 'prisma' },
      { name: 'drizzle - TypeScript ORM for Node.js', value: 'drizzle' },
      { name: 'mongoose - MongoDB object modeling for Node.js', value: 'mongoose' },
      { name: 'none - No ORM', value: 'none' }
    ];
  } else if (selectedFramework) {
    ormChoices = selectedFramework.orms.map(o => ({
      name: `${o.name} - ${o.description}`,
      value: o.name
    }));
  } else {
    throw new Error(`Framework '${framework}' not found`);
  }
  
  const { orm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'orm',
      message: 'Select an ORM:',
      choices: ormChoices
    }
  ]);
  
  let databaseChoices;
  
  if (orm === 'none') {
    databaseChoices = [{ name: 'none - No database', value: 'none' }];
  } else if (orm === 'mongoose') {
    databaseChoices = [{ name: 'mongodb - MongoDB database', value: 'mongodb' }];
  } else if (orm === 'drizzle') {
    databaseChoices = [
      { name: 'postgresql - PostgreSQL database', value: 'postgresql' },
      { name: 'mysql - MySQL database', value: 'mysql' },
      { name: 'sqlite - SQLite database', value: 'sqlite' }
    ];
  } else if (orm === 'prisma') {
    databaseChoices = [
      { name: 'postgresql - PostgreSQL database', value: 'postgresql' },
      { name: 'mysql - MySQL database', value: 'mysql' },
      { name: 'sqlite - SQLite database', value: 'sqlite' },
      { name: 'mongodb - MongoDB database (via Prisma Data Proxy)', value: 'mongodb' }
    ];
  } else if (selectedFramework) {
    const selectedORM = selectedFramework.orms.find(o => o.name === orm);
    if (!selectedORM) {
      throw new Error(`ORM '${orm}' not found`);
    }
    databaseChoices = selectedORM.databases.map(d => ({
      name: `${d.name} - ${d.description}`,
      value: d.name
    }));
  } else {
    databaseChoices = [{ name: 'none - No database', value: 'none' }];
  }
  
  const { database } = await inquirer.prompt([
    {
      type: 'list',
      name: 'database',
      message: 'Select a database:',
      choices: databaseChoices
    }
  ]);
  
  const { selectedFeatures } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedFeatures',
      message: 'Select features to include:',
      choices: features.map(f => ({
        name: `${f.name} - ${f.description}`,
        value: f.value,
        checked: f.defaultSelected
      }))
    }
  ]);
  
  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Select a package manager:',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' }
      ],
      default: 'npm'
    }
  ]);
  
  return {
    name,
    directory: cliOptions?.directory,
    template: cliOptions?.template || language,
    language: language as 'typescript' | 'javascript',
    framework,
    orm,
    database,
    features: selectedFeatures,
    packageManager
  };
};

const executeProjectCreation = async (outputDir: string, options: ProjectOptions) => {
  const tasks = new Listr([
    {
      title: 'Creating project directory',
      task: async () => {
        await createDirectory(outputDir);
      }
    },
    {
      title: `Creating ${options.framework} project with ${options.language}`,
      task: async () => {
        try {
          const frameworkCLI = frameworkCommands[options.framework as keyof typeof frameworkCommands];
          if (!frameworkCLI) {
            throw new Error(`Framework '${options.framework}' not supported`);
          }
          
          const languageCLI = frameworkCLI[options.language as keyof typeof frameworkCLI];
          if (!languageCLI) {
            throw new Error(`Language '${options.language}' not supported for framework '${options.framework}'`);
          }
          
          const success = await languageCLI.create(outputDir, options);
          
          if (!success) {
            console.log(chalk.yellow(`Using template as fallback for ${options.framework} with ${options.language}`));
            const fallbackSuccess = await createProjectFromTemplate(outputDir, options);
            
            if (!fallbackSuccess) {
              throw new Error(`Failed to create ${options.framework} project with ${options.language}`);
            }
          }
        } catch (error) {
          console.log(chalk.yellow(`Using template as fallback for ${options.framework} with ${options.language}`));
          const fallbackSuccess = await createProjectFromTemplate(outputDir, options);
          
          if (!fallbackSuccess) {
            throw new Error(`Failed to create ${options.framework} project with ${options.language}`);
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
      title: 'Setting up project structure',
      task: async () => {
        await fs.ensureDir(path.join(outputDir, 'src'));
        await fs.ensureDir(path.join(outputDir, 'src/controllers'));
        await fs.ensureDir(path.join(outputDir, 'src/models'));
        await fs.ensureDir(path.join(outputDir, 'src/routes'));
        await fs.ensureDir(path.join(outputDir, 'src/middlewares'));
        await fs.ensureDir(path.join(outputDir, 'src/services'));
        await fs.ensureDir(path.join(outputDir, 'src/utils'));
        await fs.ensureDir(path.join(outputDir, 'src/config'));
        
        if (options.features.includes('jest')) {
          await fs.ensureDir(path.join(outputDir, 'src/__tests__'));
        }
      }
    },
    {
      title: 'Creating configuration files',
      task: async () => {
        // Create .env file
        if (options.features.includes('dotenv')) {
          const envContent = `# Environment Variables
NODE_ENV=development
PORT=3000
${options.database && options.database !== 'none' ? `# Database Connection
DATABASE_URL=${getDatabaseUrl(options.database)}` : ''}
`;
          await fs.writeFile(path.join(outputDir, '.env'), envContent);
          await fs.writeFile(path.join(outputDir, '.env.example'), envContent);
          
          const gitignoreContent = `# Dependency directories
node_modules/

# Environment variables
.env

# Build output
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
          await fs.writeFile(path.join(outputDir, '.gitignore'), gitignoreContent);
        }
        
        if (options.features.includes('docker')) {
          const dockerfileContent = `FROM node:18-alpine as base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN ${options.packageManager === 'npm' ? 'npm ci' : options.packageManager === 'yarn' ? 'yarn install --frozen-lockfile' : 'pnpm install --frozen-lockfile'}

# Copy source code
COPY . .

# Build application
${options.language === 'typescript' ? 'RUN ' + (options.packageManager === 'npm' ? 'npm run build' : options.packageManager === 'yarn' ? 'yarn build' : 'pnpm build') : ''}

# Expose port
EXPOSE 3000

# Start application
CMD ["${options.packageManager === 'npm' ? 'npm' : options.packageManager} start"]
`;
          
          await fs.writeFile(path.join(outputDir, 'Dockerfile'), dockerfileContent);
          
          const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
${options.database !== 'none' ? 
`    depends_on:
      - ${options.database}` : ''}
    volumes:
      - ./:/app
      - /app/node_modules

${options.database === 'postgresql' ? 
`  postgresql:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data` 
: options.database === 'mysql' ?
`  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=app
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql`
: options.database === 'mongodb' ?
`  mongodb:
    image: mongo:6
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=app
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db`
: ''}

${options.database !== 'none' && options.database !== 'sqlite' ? 
`volumes:
  ${options.database}-data:` : ''}
`;
          
          await fs.writeFile(path.join(outputDir, 'docker-compose.yml'), dockerComposeContent);
        }
        
        if (options.features.includes('github-actions')) {
          await fs.ensureDir(path.join(outputDir, '.github/workflows'));
          
          const ciWorkflowContent = `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: '${options.packageManager}'
    
    - name: Install dependencies
      run: ${options.packageManager === 'npm' ? 'npm ci' : options.packageManager === 'yarn' ? 'yarn install --frozen-lockfile' : 'pnpm install --frozen-lockfile'}
    
${options.features.includes('eslint') ? 
`    - name: Lint
      run: ${options.packageManager === 'npm' ? 'npm run lint' : options.packageManager === 'yarn' ? 'yarn lint' : 'pnpm lint'}
` : ''}

${options.features.includes('jest') ? 
`    - name: Test
      run: ${options.packageManager === 'npm' ? 'npm test' : options.packageManager === 'yarn' ? 'yarn test' : 'pnpm test'}
` : ''}

    - name: Build
      run: ${options.packageManager === 'npm' ? 'npm run build' : options.packageManager === 'yarn' ? 'yarn build' : 'pnpm build'}
`;
          
          await fs.writeFile(path.join(outputDir, '.github/workflows/ci.yml'), ciWorkflowContent);
        }
        
        try {
          const packageJsonPath = path.join(outputDir, 'package.json');
          if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            
            packageJson.scripts = packageJson.scripts || {};
            
            if (options.language === 'typescript') {
              packageJson.scripts.start = 'node dist/index.js';
              packageJson.scripts.build = 'tsc';
              packageJson.scripts.dev = 'ts-node-dev --respawn --transpile-only src/index.ts';
            } else {
              packageJson.scripts.start = 'node src/index.js';
              packageJson.scripts.dev = 'nodemon src/index.js';
            }
            
            if (options.features.includes('jest')) {
              packageJson.scripts.test = 'jest';
              packageJson.scripts['test:watch'] = 'jest --watch';
              packageJson.scripts['test:coverage'] = 'jest --coverage';
            }
            
            if (options.features.includes('eslint')) {
              packageJson.scripts.lint = 'eslint src --ext .ts,.js';
              packageJson.scripts['lint:fix'] = 'eslint src --ext .ts,.js --fix';
            }
            
            if (options.features.includes('prettier')) {
              packageJson.scripts.format = 'prettier --write "src/**/*.{ts,js}"';
            }
            
            if (options.features.includes('biome')) {
              packageJson.scripts.biome = 'biome check src';
              packageJson.scripts['biome:fix'] = 'biome check --apply src';
            }
            
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
          }
        } catch (error) {
          console.error('Error updating package.json:', error);
        }
      }
    }
  ]);
  
  await tasks.run();
};

const displaySuccessMessage = (outputDir: string, options: ProjectOptions) => {
  console.log();
  console.log(chalk.green('✨ Project created successfully!'));
  console.log();
  console.log(`${chalk.bold('Next steps:')}`);
  console.log(`  cd ${chalk.cyan(path.relative(process.cwd(), outputDir))}`);
  
  const runCommand = options.packageManager === 'npm' ? 'npm run' : 
                     options.packageManager === 'yarn' ? 'yarn' : 'pnpm';
  
  console.log(`  ${chalk.cyan(`${runCommand} dev`)}`);
  
  if (options.database !== 'none' && options.features.includes('docker')) {
    console.log(`  ${chalk.cyan(`docker-compose up -d`)}`);
  }
  
  console.log();
  console.log(`To learn more about Aspen, visit: ${chalk.cyan('https://github.com/yourusername/aspen')}`);
  console.log();
};

const getDatabaseUrl = (database: string): string => {
  switch (database) {
    case 'postgresql':
      return 'postgresql://postgres:postgres@localhost:5432/app?schema=public';
    case 'mysql':
      return 'mysql://user:password@localhost:3306/app';
    case 'sqlite':
      return 'file:./dev.db';
    case 'mongodb':
      return 'mongodb://root:password@localhost:27017/app?authSource=admin';
    default:
      return '';
  }
};
