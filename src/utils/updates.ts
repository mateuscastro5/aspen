import chalk from 'chalk';
import { execa } from 'execa';
import ora from 'ora';
import pkg from '../../package.json' with { type: 'json' };

export const checkForUpdates = async (): Promise<void> => {
  try {
    const spinner = ora('Checking for updates...').start();
    const { stdout } = await execa('npm', ['view', 'aspen', 'version']);
    const latestVersion = stdout.trim();
    const currentVersion = pkg.version;
    
    if (latestVersion !== currentVersion) {
      spinner.succeed(`Update available ${chalk.dim(currentVersion)} → ${chalk.green(latestVersion)}`);
      console.log(`Run ${chalk.cyan('npm install -g aspen')} to update.`);
    } else {
      spinner.succeed(`You are using the latest version of Aspen (${chalk.green(currentVersion)})`);
    }
  } catch (error) {
    return;
  }
};

export default checkForUpdates;
