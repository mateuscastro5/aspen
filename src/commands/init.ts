import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import Listr from 'listr';
import { features } from '../templates/data.js';
import { addFeatures } from '../utils/frameworks.js';
import { ProjectOptions } from '../types/index.js';

export const initProject = async (options?: { template?: string }) => {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    console.log(chalk.red('Error: No package.json found in the current directory.'));
    console.log(`Run ${chalk.cyan('npm init')} first, or use ${chalk.cyan('aspen create')} to create a new project.`);
    return;
  }
  
  const packageJson = await fs.readJson(packageJsonPath);
  
  console.log(chalk.bold(`\nInitializing Aspen in existing project: ${chalk.cyan(packageJson.name)}\n`));
  
  const isTypeScript = await fs.pathExists(path.resolve(process.cwd(), 'tsconfig.json'));
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let detectedFramework = 'unknown';
  if (dependencies.express) detectedFramework = 'express';
  if (dependencies.fastify) detectedFramework = 'fastify';
  if (dependencies['@nestjs/core']) detectedFramework = 'nestjs';
  if (dependencies.hono) detectedFramework = 'hono';
  if (dependencies.adonis || dependencies['@adonisjs/core']) detectedFramework = 'adonisjs';
  
  let detectedORM = 'none';
  if (dependencies.prisma || dependencies['@prisma/client']) detectedORM = 'prisma';
  if (dependencies.typeorm) detectedORM = 'typeorm';
  if (dependencies.mongoose) detectedORM = 'mongoose';
  if (dependencies.drizzle) detectedORM = 'drizzle';
  if (dependencies.sequelize) detectedORM = 'sequelize';
  
  const { language, framework, orm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Which language is this project using?',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' }
      ],
      default: isTypeScript ? 'typescript' : 'javascript'
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Which framework is this project using?',
      choices: [
        { name: 'Express', value: 'express' },
        { name: 'Fastify', value: 'fastify' },
        { name: 'NestJS', value: 'nestjs' },
        { name: 'Hono', value: 'hono' },
        { name: 'AdonisJS', value: 'adonisjs' },
        { name: 'Other', value: 'other' }
      ],
      default: detectedFramework === 'unknown' ? 'express' : detectedFramework
    },
    {
      type: 'list',
      name: 'orm',
      message: 'Which ORM is this project using?',
      choices: [
        { name: 'Prisma', value: 'prisma' },
        { name: 'TypeORM', value: 'typeorm' },
        { name: 'Mongoose', value: 'mongoose' },
        { name: 'Drizzle', value: 'drizzle' },
        { name: 'Sequelize', value: 'sequelize' },
        { name: 'None', value: 'none' }
      ],
      default: detectedORM
    }
  ]);
  
  const { selectedFeatures } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedFeatures',
      message: 'Select features to add to your project:',
      choices: features.map(f => ({
        name: `${f.name} - ${f.description}`,
        value: f.value,
        checked: f.defaultSelected && !dependencies[f.value]
      }))
    }
  ]);
  
  const projectOptions: ProjectOptions = {
    name: packageJson.name,
    language: language as 'typescript' | 'javascript',
    framework,
    orm,
    database: 'none',
    features: selectedFeatures,
    packageManager: 'npm'
  };
  
  const tasks = new Listr([
    {
      title: 'Adding selected features',
      task: async () => {
        const success = await addFeatures(process.cwd(), projectOptions);
        if (!success) {
          throw new Error('Failed to add features');
        }
      }
    },
    {
      title: 'Setting up project structure',
      task: async () => {
        await fs.ensureDir(path.join(process.cwd(), 'src'));
        await fs.ensureDir(path.join(process.cwd(), 'src/controllers'));
        await fs.ensureDir(path.join(process.cwd(), 'src/models'));
        await fs.ensureDir(path.join(process.cwd(), 'src/routes'));
        await fs.ensureDir(path.join(process.cwd(), 'src/middlewares'));
        await fs.ensureDir(path.join(process.cwd(), 'src/services'));
        await fs.ensureDir(path.join(process.cwd(), 'src/utils'));
        await fs.ensureDir(path.join(process.cwd(), 'src/config'));
        
        if (projectOptions.features.includes('jest')) {
          await fs.ensureDir(path.join(process.cwd(), 'src/__tests__'));
        }
      }
    },
    {
      title: 'Updating package.json',
      task: async () => {
        const updatedPackageJson = await fs.readJson(packageJsonPath);
        
        updatedPackageJson.scripts = updatedPackageJson.scripts || {};
        
        if (language === 'typescript' && !updatedPackageJson.scripts.build) {
          updatedPackageJson.scripts.build = 'tsc';
        }
        
        if (!updatedPackageJson.scripts.dev) {
          if (language === 'typescript') {
            updatedPackageJson.scripts.dev = 'ts-node-dev --respawn --transpile-only src/index.ts';
          } else {
            updatedPackageJson.scripts.dev = 'nodemon src/index.js';
          }
        }
        
        if (!updatedPackageJson.scripts.start) {
          if (language === 'typescript') {
            updatedPackageJson.scripts.start = 'node dist/index.js';
          } else {
            updatedPackageJson.scripts.start = 'node src/index.js';
          }
        }
        
        if (projectOptions.features.includes('jest') && !updatedPackageJson.scripts.test) {
          updatedPackageJson.scripts.test = 'jest';
          updatedPackageJson.scripts['test:watch'] = 'jest --watch';
          updatedPackageJson.scripts['test:coverage'] = 'jest --coverage';
        }
        
        if (projectOptions.features.includes('eslint') && !updatedPackageJson.scripts.lint) {
          updatedPackageJson.scripts.lint = `eslint src --ext .${language === 'typescript' ? 'ts' : 'js'}`;
          updatedPackageJson.scripts['lint:fix'] = `eslint src --ext .${language === 'typescript' ? 'ts' : 'js'} --fix`;
        }
        
        if (projectOptions.features.includes('prettier') && !updatedPackageJson.scripts.format) {
          updatedPackageJson.scripts.format = `prettier --write "src/**/*.{${language === 'typescript' ? 'ts' : 'js'}}"`;
        }
        
        if (projectOptions.features.includes('biome') && !updatedPackageJson.scripts.biome) {
          updatedPackageJson.scripts.biome = 'biome check src';
          updatedPackageJson.scripts['biome:fix'] = 'biome check --apply src';
        }
        
        await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });
      }
    }
  ]);
  
  try {
    await tasks.run();
    
    console.log();
    console.log(chalk.green('✨ Project initialized successfully!'));
    console.log();
    console.log(`${chalk.bold('Next steps:')}`);
    console.log(`  ${chalk.cyan('npm run dev')} - Start the development server`);
    
    if (projectOptions.features.includes('jest')) {
      console.log(`  ${chalk.cyan('npm test')} - Run tests`);
    }
    
    if (projectOptions.features.includes('eslint')) {
      console.log(`  ${chalk.cyan('npm run lint')} - Lint your code`);
    }
    
    console.log();
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  }
};

export default initProject;
