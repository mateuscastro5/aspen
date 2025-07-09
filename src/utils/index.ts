import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTemplateDir = (template: string): string => {
  return path.resolve(__dirname, '../../templates', template);
};

export const resolveOutputDir = (projectName: string, directory?: string): string => {
  const targetDir = directory || process.cwd();
  return path.resolve(targetDir, projectName);
};

export const validateProjectName = (name: string): string | true => {
  if (!name) {
    return 'Project name cannot be empty';
  }
  
  if (!/^[a-z0-9-_]+$/.test(name)) {
    return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
  }
  
  return true;
};

export const checkDirectory = async (dir: string): Promise<boolean> => {
  try {
    if (await fs.pathExists(dir)) {
      const files = await fs.readdir(dir);
      return files.length === 0;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const createDirectory = async (dir: string): Promise<void> => {
  const spinner = ora(`Creating directory ${chalk.cyan(dir)}`).start();
  try {
    await fs.ensureDir(dir);
    spinner.succeed(`Created directory ${chalk.cyan(dir)}`);
  } catch (error) {
    spinner.fail(`Failed to create directory ${chalk.cyan(dir)}`);
    throw error;
  }
};

export const copyTemplateFiles = async (sourceDir: string, targetDir: string, templateData: Record<string, any>): Promise<void> => {
  const spinner = ora('Copying template files').start();
  try {
    const files = await fs.readdir(sourceDir, { withFileTypes: true });
    
    for (const file of files) {
      const srcPath = path.join(sourceDir, file.name);
      const destPath = path.join(targetDir, file.name);
      
      if (file.isDirectory()) {
        await fs.ensureDir(destPath);
        await copyTemplateFiles(srcPath, destPath, templateData);
      } else {
        if (file.name.endsWith('.ejs')) {
          const content = await fs.readFile(srcPath, 'utf8');
          const rendered = ejs.render(content, templateData);
          await fs.writeFile(destPath.replace('.ejs', ''), rendered);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
    spinner.succeed('Template files copied successfully');
  } catch (error) {
    spinner.fail('Failed to copy template files');
    throw error;
  }
};

export const checkPackageManagerAvailable = async (packageManager: string): Promise<boolean> => {
  try {
    await execa(packageManager, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export const ensurePackageManagerInstalled = async (packageManager: string): Promise<void> => {
  const isAvailable = await checkPackageManagerAvailable(packageManager);
  
  if (!isAvailable && packageManager === 'yarn') {
    const spinner = ora('Yarn not found. Installing Yarn globally...').start();
    try {
      await execa('npm', ['install', '-g', 'yarn'], { stdio: 'ignore' });
      spinner.succeed('Yarn installed successfully');
    } catch (error) {
      spinner.fail('Failed to install Yarn. Please install it manually: npm install -g yarn');
      throw error;
    }
  } else if (!isAvailable && packageManager === 'pnpm') {
    const spinner = ora('pnpm not found. Installing pnpm globally...').start();
    try {
      await execa('npm', ['install', '-g', 'pnpm'], { stdio: 'ignore' });
      spinner.succeed('pnpm installed successfully');
    } catch (error) {
      spinner.fail('Failed to install pnpm. Please install it manually: npm install -g pnpm');
      throw error;
    }
  } else if (!isAvailable) {
    throw new Error(`Package manager '${packageManager}' is not available and cannot be auto-installed`);
  }
};

export const installProjectDependencies = async (dir: string, packageManager: string): Promise<void> => {
  await ensurePackageManagerInstalled(packageManager);
  
  const spinner = ora(`Installing dependencies with ${chalk.cyan(packageManager)}`).start();
  try {
    const command = packageManager;
    let args: string[];
    
    switch (packageManager) {
      case 'yarn':
        args = ['install'];
        break;
      case 'pnpm':
        args = ['install'];
        break;
      case 'npm':
      default:
        args = ['install'];
        break;
    }
    
    await execa(command, args, {
      cwd: dir,
      stdio: 'ignore'
    });
    
    spinner.succeed(`Dependencies installed successfully with ${packageManager}`);
    
    const lockFiles = {
      npm: 'package-lock.json',
      yarn: 'yarn.lock',
      pnpm: 'pnpm-lock.yaml'
    };
    
    const lockFile = lockFiles[packageManager as keyof typeof lockFiles] || 'package-lock.json';
    const lockFilePath = path.join(dir, lockFile);
    
    if (await fs.pathExists(lockFilePath)) {
      console.log(chalk.green(`✓ Generated ${lockFile}`));
    }
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
};

export const getAvailableTemplates = async (): Promise<string[]> => {
  const templatesDir = path.resolve(__dirname, '../../templates');
  try {
    const templates = await fs.readdir(templatesDir);
    return templates.filter(async (template) => {
      const templatePath = path.join(templatesDir, template);
      const stat = await fs.stat(templatePath);
      return stat.isDirectory();
    });
  } catch (error) {
    console.error(chalk.red('Error reading templates directory'));
    return [];
  }
};
