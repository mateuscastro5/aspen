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
    
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = options.name;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    
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
        await executeCommand('npm', ['init', '-y'], projectPath);
        await executeCommand('npm', ['install', 'express', 'dotenv', 'cors', 'helmet'], projectPath);
        await executeCommand('npm', ['install', '-D', 'typescript', '@types/node', '@types/express', '@types/cors', 'ts-node-dev', 'rimraf'], projectPath);
        
        await executeCommand('npx', ['tsc', '--init'], projectPath);
        
        return true;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        await executeCommand('npm', ['init', '-y'], projectPath);
        await executeCommand('npm', ['install', 'express', 'dotenv', 'cors', 'helmet'], projectPath);
        
        return true;
      }
    }
  },
  fastify: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        await executeCommand('npm', ['init', '-y'], projectPath);
        await executeCommand('npm', ['install', 'fastify', 'dotenv', '@fastify/cors'], projectPath);
        await executeCommand('npm', ['install', '-D', 'typescript', '@types/node', 'ts-node-dev', 'rimraf'], projectPath);
        
        await executeCommand('npx', ['tsc', '--init'], projectPath);
        
        return true;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        await executeCommand('npm', ['init', '-y'], projectPath);
        await executeCommand('npm', ['install', 'fastify', 'dotenv', '@fastify/cors'], projectPath);
        
        return true;
      }
    }
  },
  nestjs: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const projectName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        await executeCommand('npx', ['@nestjs/cli', 'new', projectName, '--package-manager', options.packageManager, '--skip-git'], parentDir);
        
        return true;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const projectName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        await executeCommand('npx', ['@nestjs/cli', 'new', projectName, '--package-manager', options.packageManager, '--skip-git', '--language', 'javascript'], parentDir);
        
        return true;
      }
    }
  },
  hono: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const tempName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        await executeCommand('npm', ['create', 'hono@latest', tempName, '--', '--template', 'nodejs'], parentDir);
        
        return true;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        const tempName = path.basename(projectPath);
        const parentDir = path.dirname(projectPath);
        
        await executeCommand('npm', ['create', 'hono@latest', tempName], parentDir);
        
        return true;
      }
    }
  },
  adonisjs: {
    typescript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        await executeCommand('npm', ['init', 'adonisjs@latest', path.basename(projectPath)], path.dirname(projectPath));
        
        return true;
      }
    },
    javascript: {
      create: async (projectPath: string, options: ProjectOptions) => {
        await executeCommand('npm', ['init', 'adonisjs@latest', path.basename(projectPath)], path.dirname(projectPath));
        
        return true;
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
      } else if (options.framework === 'hono') {
        await executeCommand('npm', ['install', '@hono/swagger-ui'], projectPath);
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
    
    if (options.framework === 'express' && options.language === 'typescript') {
      templateDir = path.resolve(__dirname, '../../templates/express-typescript');
    } else if (options.framework === 'fastify' && options.language === 'typescript') {
      templateDir = path.resolve(__dirname, '../../templates/fastify-typescript');
    } else if (options.framework === 'hono' && options.language === 'typescript') {
      await executeCommand('npm', ['init', '-y'], projectPath);
      await executeCommand('npm', ['install', 'hono'], projectPath);
      await executeCommand('npm', ['install', '-D', 'typescript', '@types/node', 'ts-node-dev'], projectPath);
      await executeCommand('npx', ['tsc', '--init'], projectPath);
      
      const srcDir = path.join(projectPath, 'src');
      await fs.ensureDir(srcDir);
      
      const indexContent = `import { Hono } from 'hono';\nimport { logger } from 'hono/logger';\nimport { cors } from 'hono/cors';\n\nconst app = new Hono();\n\n// Middleware\napp.use('*', logger());\napp.use('*', cors());\n\n// Routes\napp.get('/', (c) => c.json({ message: 'Hello Hono!' }));\napp.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));\n\n// Start the server\nconst port = process.env.PORT || 3000;\nconsole.log(\`Server is running on port \${port}\`);\n\nexport default app;`;
      await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent);
      
      spinner.succeed(`Created Hono project manually`);
      return true;
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

export const executeCommand = async (command: string, args: string[], cwd: string) => {
  try {
    console.log(`\n🔧 Executing: ${command} ${args.join(' ')}`);
    
    const result = await execa(command, args, {
      cwd,
      stdio: 'inherit'
    });
    
    console.log(`✅ Command completed successfully`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error executing command: ${command} ${args.join(' ')}`);
    console.error(`Error details:`, error.message);
    
    if (error.code === 'ENOENT') {
      console.error(`💡 Make sure ${command} is installed and available in PATH`);
    }
    
    throw error;
  }
};
