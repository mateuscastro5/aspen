import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
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
  nestjs: {
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
          options.packageManager,
          '--skip-git'
        ], parentDir, 300000, false);

        return true;
      } catch (error) {
        console.error('Failed to create NestJS project:', error);
        throw new Error(`Failed to create NestJS project: ${error}`);
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

      case 'drizzle':
        await executeCommand('npm', ['install', 'drizzle-orm'], projectPath);
        await executeCommand('npm', ['install', '-D', 'drizzle-kit'], projectPath);

        if (options.database === 'postgresql') {
          await executeCommand('npm', ['install', 'postgres'], projectPath);
        } else if (options.database === 'sqlite') {
          await executeCommand('npm', ['install', 'better-sqlite3'], projectPath);
          await executeCommand('npm', ['install', '-D', '@types/better-sqlite3'], projectPath);
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
    if (options.features.includes('lint')) {
      await executeCommand('npm', ['install', '-D', 'eslint', 'typescript-eslint', 'prettier', 'eslint-config-prettier'], projectPath);
    }

    if (options.features.includes('test')) {
      await executeCommand('npm', ['install', '-D', 'vitest'], projectPath);
    }

    if (options.features.includes('swagger')) {
      if (options.framework === 'express') {
        await executeCommand('npm', ['install', 'swagger-ui-express'], projectPath);
        await executeCommand('npm', ['install', '-D', '@types/swagger-ui-express'], projectPath);
      } else if (options.framework === 'fastify') {
        await executeCommand('npm', ['install', '@fastify/swagger', '@fastify/swagger-ui'], projectPath);
      } else if (options.framework === 'nestjs') {
        await executeCommand('npm', ['install', '@nestjs/swagger'], projectPath);
      }
    }

    if (options.features.includes('helmet')) {
      if (options.framework === 'fastify') {
        await executeCommand('npm', ['install', '@fastify/helmet'], projectPath);
      } else {
        await executeCommand('npm', ['install', 'helmet'], projectPath);
      }
    }

    if (options.features.includes('cors')) {
      if (options.framework === 'express') {
        await executeCommand('npm', ['install', 'cors'], projectPath);
      } else if (options.framework === 'fastify') {
        await executeCommand('npm', ['install', '@fastify/cors'], projectPath);
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
    const templateDir = path.resolve(__dirname, '../../templates', `${options.framework}-typescript`);

    if (!await fs.pathExists(templateDir)) {
      spinner.fail(`No template available for ${options.framework}`);
      return false;
    }

    const success = await copyTemplateFiles(templateDir, projectPath, options);

    if (success) {
      spinner.succeed(`Created ${options.framework} project from template`);
      return true;
    } else {
      spinner.fail('Failed to create project from template');
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

    await execa(command, args, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      timeout: timeoutMs
    });

    if (!silent) {
      console.log('✅ Command completed successfully');
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
      console.error('📤 Stdout:', error.stdout);
    }
    if (error.stderr) {
      console.error('📥 Stderr:', error.stderr);
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
  } catch {
    console.log(`🔧 Installing ${cliName} globally...`);
    await executeCommand('npm', ['install', '-g', packageName], process.cwd(), 120000, false);
    console.log(`✅ ${cliName} installed successfully`);
  }
};
