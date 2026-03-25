import chalk from 'chalk';

// Simple logger - no over-engineering
export const logger = {
  info: (msg: string, ...args: any[]) => console.log(chalk.blue(msg), ...args),
  warn: (msg: string, ...args: any[]) => console.log(chalk.yellow(msg), ...args),
  error: (msg: string, ...args: any[]) => console.error(chalk.red(msg), ...args),
  debug: (msg: string, ...args: any[]) => console.log(chalk.gray(msg), ...args),
  success: (msg: string, ...args: any[]) => console.log(chalk.green(msg), ...args),
};

export function configureLogger(): void {
  // No-op for compatibility with existing code
}