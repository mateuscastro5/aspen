import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectOptions } from '../types/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const copyTemplateFiles = async (sourceDir: string, targetDir: string, options: ProjectOptions): Promise<boolean> => {
  const spinner = ora('Copying template files').start();
  try {
    await fs.copy(sourceDir, targetDir, {
      overwrite: true,
      filter: (src) => {
        return !src.includes('node_modules') && !src.includes('.git');
      }
    });
    
    const processEjsFiles = async (dir: string) => {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
          await processEjsFiles(filePath);
        } else if (file.endsWith('.ejs')) {
          let content = await fs.readFile(filePath, 'utf-8');
          
          content = content.replace(/<%= projectName %>/g, options.name);
          content = content.replace(/<%= description %>/g, `A ${options.framework} application`);
          
          const newFilePath = filePath.replace('.ejs', '');
          await fs.writeFile(newFilePath, content);
          
          await fs.remove(filePath);
        }
      }
    };
    
    await processEjsFiles(targetDir);
    
    spinner.succeed('Template files copied successfully');
    return true;
  } catch (error) {
    spinner.fail(`Failed to copy template files: ${error}`);
    return false;
  }
};

export const frameworkCommands = {
  express: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        return false;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        return false;
      }
    }
  },
  fastify: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        return false;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        return false;
      }
    }
  },
  nestjs: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const projectName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        if (await fs.pathExists(projectPath)) {
          await fs.remove(projectPath);
        }
        
        try {
          await ensureCLIInstalled('NestJS CLI', '@nestjs/cli', 'nest');
          
          console.log('🏗️ Creating NestJS project...');
          await executeCommand('nest', [
            'new', 
            projectName, 
            '--package-manager', 
            options.packageManager || 'npm',
            '--skip-git'
          ], parentDir, 300000, false);
          
          return true;
        } catch (error) {
          console.error('Failed to create NestJS project:', error);
          throw new Error(`Failed to create NestJS project: ${error}`);
        }
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const projectName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        if (await fs.pathExists(projectPath)) {
          await fs.remove(projectPath);
        }
        
        try {
          await ensureCLIInstalled('NestJS CLI', '@nestjs/cli', 'nest');
          
          console.log('🏗️ Creating NestJS project...');
          await executeCommand('nest', [
            'new', 
            projectName, 
            '--package-manager', 
            options.packageManager || 'npm',
            '--skip-git',
            '--language', 
            'JS'
          ], parentDir, 300000, false);
          
          return true;
        } catch (error) {
          console.error('Failed to create NestJS project:', error);
          throw new Error(`Failed to create NestJS project: ${error}`);
        }
      }
    }
  },
  adonisjs: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const projectName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        if (await fs.pathExists(projectPath)) {
          await fs.remove(projectPath);
        }
        
        try {
          console.log('🏗️ Creating AdonisJS project...');
          await executeCommand('npm', [
            'init', 
            'adonisjs@latest', 
            projectName
          ], parentDir, 300000, false);
          
          return true;
        } catch (error) {
          console.error('Failed to create AdonisJS project:', error);
          throw new Error(`Failed to create AdonisJS project: ${error}`);
        }
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const projectName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        if (await fs.pathExists(projectPath)) {
          await fs.remove(projectPath);
        }
        
        try {
          console.log('🏗️ Creating AdonisJS project...');
          await executeCommand('npm', [
            'init', 
            'adonisjs@latest', 
            projectName
          ], parentDir, 300000, false);
          
          return true;
        } catch (error) {
          console.error('Failed to create AdonisJS project:', error);
          throw new Error(`Failed to create AdonisJS project: ${error}`);
        }
      }
    }
  }
};

export const addORM = async (projectPath: string, options: ProjectOptions) => {
  const spinner = ora('Adding ORM...').start();
  try {
    switch (options.orm) {
      case 'prisma':
        await executeCommand('npm', ['install', '-D', 'prisma'], projectPath);
        await executeCommand('npx', ['prisma', 'init'], projectPath);
        
        if (options.database !== 'none') {
          const schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
          if (await fs.pathExists(schemaPath)) {
            let schema = await fs.readFile(schemaPath, 'utf8');
            schema = schema.replace(/provider = ".*"/, `provider = "${options.database}"`);
            await fs.writeFile(schemaPath, schema);
          }
        }
        break;
        
      case 'typeorm':
        await executeCommand('npm', ['install', 'typeorm', 'reflect-metadata'], projectPath);
        if (options.database === 'postgresql') {
          await executeCommand('npm', ['install', 'pg'], projectPath);
        } else if (options.database === 'mysql') {
          await executeCommand('npm', ['install', 'mysql2'], projectPath);
        } else if (options.database === 'sqlite') {
          await executeCommand('npm', ['install', 'sqlite3'], projectPath);
        } else if (options.database === 'mongodb') {
          await executeCommand('npm', ['install', 'mongodb'], projectPath);
        }
        break;
        
      case 'drizzle':
        await executeCommand('npm', ['install', 'drizzle-orm'], projectPath);
        await executeCommand('npm', ['install', '-D', 'drizzle-kit'], projectPath);
        
        if (options.database === 'postgresql') {
          await executeCommand('npm', ['install', 'postgres'], projectPath);
        } else if (options.database === 'mysql') {
          await executeCommand('npm', ['install', 'mysql2'], projectPath);
        } else if (options.database === 'sqlite') {
          await executeCommand('npm', ['install', 'better-sqlite3'], projectPath);
          await executeCommand('npm', ['install', '-D', '@types/better-sqlite3'], projectPath);
        }
        break;
        
      case 'mongoose':
        await executeCommand('npm', ['install', 'mongoose'], projectPath);
        break;
        
      case 'sequelize':
        await executeCommand('npm', ['install', 'sequelize'], projectPath);
        if (options.database === 'postgresql') {
          await executeCommand('npm', ['install', 'pg', 'pg-hstore'], projectPath);
        } else if (options.database === 'mysql') {
          await executeCommand('npm', ['install', 'mysql2'], projectPath);
        } else if (options.database === 'sqlite') {
          await executeCommand('npm', ['install', 'sqlite3'], projectPath);
        }
        break;
        
      case 'none':
        break;
    }
    
    spinner.succeed('ORM added successfully');
    return true;
  } catch (error) {
    spinner.fail(`Failed to add ORM: ${error}`);
    return false;
  }
};

export const addFeatures = async (projectPath: string, options: ProjectOptions) => {
  const spinner = ora('Adding features...').start();
  
  try {
    if (options.features.includes('eslint')) {
      await executeCommand('npm', ['install', '-D', 'eslint'], projectPath);
      if (options.language === 'typescript') {
        await executeCommand('npm', ['install', '-D', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'], projectPath);
      }
    }
    
    if (options.features.includes('prettier')) {
      await executeCommand('npm', ['install', '-D', 'prettier'], projectPath);
      if (options.features.includes('eslint')) {
        await executeCommand('npm', ['install', '-D', 'eslint-config-prettier', 'eslint-plugin-prettier'], projectPath);
      }
    }
    
    if (options.features.includes('biome')) {
      await executeCommand('npm', ['install', '-D', '@biomejs/biome'], projectPath);
    }
    
    if (options.features.includes('jest')) {
      await executeCommand('npm', ['install', '-D', 'jest'], projectPath);
      if (options.language === 'typescript') {
        await executeCommand('npm', ['install', '-D', 'ts-jest', '@types/jest'], projectPath);
      }
    }
    
    if (options.features.includes('swagger')) {
      if (options.framework === 'express') {
        await executeCommand('npm', ['install', 'swagger-ui-express', 'swagger-jsdoc'], projectPath);
        if (options.language === 'typescript') {
          await executeCommand('npm', ['install', '-D', '@types/swagger-ui-express', '@types/swagger-jsdoc'], projectPath);
        }
      } else if (options.framework === 'fastify') {
        await executeCommand('npm', ['install', '@fastify/swagger'], projectPath);
      } else if (options.framework === 'nestjs') {
        await executeCommand('npm', ['install', '@nestjs/swagger'], projectPath);
      }
    }
    
    if (options.features.includes('docker')) {
    }
    
    if (options.features.includes('winston')) {
      await executeCommand('npm', ['install', 'winston'], projectPath);
    }
    
    if (options.features.includes('jwt')) {
      await executeCommand('npm', ['install', 'jsonwebtoken'], projectPath);
      if (options.language === 'typescript') {
        await executeCommand('npm', ['install', '-D', '@types/jsonwebtoken'], projectPath);
      }
      
      if (options.framework === 'express') {
        await executeCommand('npm', ['install', 'passport', 'passport-jwt'], projectPath);
        if (options.language === 'typescript') {
          await executeCommand('npm', ['install', '-D', '@types/passport', '@types/passport-jwt'], projectPath);
        }
      } else if (options.framework === 'nestjs') {
        await executeCommand('npm', ['install', '@nestjs/passport', '@nestjs/jwt', 'passport-jwt'], projectPath);
        if (options.language === 'typescript') {
          await executeCommand('npm', ['install', '-D', '@types/passport-jwt'], projectPath);
        }
      }
    }
    
    if (options.features.includes('husky')) {
      await executeCommand('npm', ['install', '-D', 'husky', 'lint-staged'], projectPath);
      await executeCommand('npx', ['husky-init'], projectPath);
    }
    
    if (options.features.includes('dotenv')) {
      await executeCommand('npm', ['install', 'dotenv'], projectPath);
    }
    
    if (options.features.includes('helmet')) {
      if (options.framework === 'express') {
        await executeCommand('npm', ['install', 'helmet'], projectPath);
      } else if (options.framework === 'fastify') {
        await executeCommand('npm', ['install', '@fastify/helmet'], projectPath);
      }
    }
    
    if (options.features.includes('rate-limiting')) {
      if (options.framework === 'express') {
        await executeCommand('npm', ['install', 'express-rate-limit'], projectPath);
      } else if (options.framework === 'fastify') {
        await executeCommand('npm', ['install', '@fastify/rate-limit'], projectPath);
      }
    }
    
    spinner.succeed('Features added successfully');
    return true;
  } catch (error) {
    spinner.fail(`Failed to add features: ${error}`);
    return false;
  }
};

export const createProjectFromTemplate = async (projectPath: string, options: ProjectOptions): Promise<boolean> => {
  const spinner = ora(`Creating ${options.framework} project from template`).start();
  
  try {
    let templateDir: string;
    
    // Usar templates apenas para Express e Fastify (frameworks simples)
    if (options.framework === 'express' && options.language === 'typescript') {
      templateDir = path.resolve(__dirname, '../../templates/express-typescript');
    } else if (options.framework === 'fastify' && options.language === 'typescript') {
      templateDir = path.resolve(__dirname, '../../templates/fastify-typescript');
    } else if (options.framework === 'express' && options.language === 'javascript') {
      // Para JavaScript, usar template TypeScript como base e converter
      templateDir = path.resolve(__dirname, '../../templates/express-typescript');
    } else if (options.framework === 'fastify' && options.language === 'javascript') {
      // Para JavaScript, usar template TypeScript como base e converter
      templateDir = path.resolve(__dirname, '../../templates/fastify-typescript');
    } else {
      spinner.fail(`No template available for ${options.framework} with ${options.language}`);
      return false;
    }
    
    const success = await copyTemplateFiles(templateDir, projectPath, options);
    
    if (success) {
      spinner.succeed(`Created ${options.framework} project from template`);
      return true;
    } else {
      spinner.fail(`Failed to create project from template`);
      return false;
    }
  } catch (error) {
    spinner.fail(`Failed to create project from template: ${error}`);
    return false;
  }
};

export const executeCommand = async (command: string, args: string[], cwd: string, timeoutMs: number = 300000, silent: boolean = true) => {
  try {
    if (!silent) {
      console.log(`\n🔧 Executing: ${command} ${args.join(' ')}`);
      console.log(`📁 Working directory: ${cwd}`);
    }
    
    const result = await execa(command, args, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      timeout: timeoutMs
    });
    
    if (!silent) {
      console.log(`✅ Command completed successfully`);
    }
    return true;
  } catch (error: any) {
    if (error.timedOut) {
      console.error(`⏰ Command timed out after ${timeoutMs / 1000} seconds`);
    }
    
    console.error(`❌ Error executing command: ${command} ${args.join(' ')}`);
    console.error(`📁 Working directory: ${cwd}`);
    console.error(`Exit code: ${error.exitCode}`);
    
    if (error.stdout) {
      console.error(`📤 Stdout:`, error.stdout);
    }
    if (error.stderr) {
      console.error(`📥 Stderr:`, error.stderr);
    }
    
    if (error.code === 'ENOENT') {
      console.error(`💡 Make sure ${command} is installed and available in PATH`);
    }
    
    throw error;
  }
};

const ensureCLIInstalled = async (cliName: string, packageName: string, checkCommand: string) => {
  try {
    await executeCommand(checkCommand, ['--version'], process.cwd(), 10000, true);
    console.log(`✅ ${cliName} is already installed`);
  } catch (error) {
    console.log(`🔧 Installing ${cliName} globally...`);
    await executeCommand('npm', ['install', '-g', packageName], process.cwd(), 120000, false);
    console.log(`✅ ${cliName} installed successfully`);
  }
};
