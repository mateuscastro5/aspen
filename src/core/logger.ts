import ora from 'ora';

export interface Logger {
  step<T>(title: string, task: () => Promise<T>): Promise<T>;
}

export const createLogger = (silent: boolean): Logger => ({
  async step<T>(title: string, task: () => Promise<T>): Promise<T> {
    if (silent) {
      return task();
    }
    const spinner = ora(title).start();
    try {
      const result = await task();
      spinner.succeed(title);
      return result;
    } catch (error) {
      spinner.fail(title);
      throw error;
    }
  }
});
