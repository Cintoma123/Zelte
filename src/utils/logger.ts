import chalk from 'chalk';
import { formatISO } from 'date-fns';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
  setVerbose(verbose: boolean): void;
}

class ConsoleLogger implements Logger {
  private verbose: boolean;
  private level: LogLevel;
  private includeTimestamp: boolean;

  constructor(options: { verbose?: boolean; level?: LogLevel; timestamp?: boolean } = {}) {
    this.verbose = options.verbose ?? false;
    this.level = options.level ?? 'info';
    this.includeTimestamp = options.timestamp ?? false;
  }

  private getTimestamp(): string {
    return formatISO(new Date(), { representation: 'time' });
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = this.includeTimestamp ? `${this.getTimestamp()} ` : '';
    return `${timestamp}[${level}] ${message}`;
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success'];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(messageLevel);
    return messageIndex >= currentIndex || messageLevel === 'success';
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue(this.formatMessage('INFO', message)), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.log(chalk.yellow(this.formatMessage('WARN', message)), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red(this.formatMessage('ERROR', message)), ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.verbose && this.shouldLog('debug')) {
      console.log(chalk.gray(this.formatMessage('DEBUG', message)), ...args);
    }
  }

  trace(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(chalk.dim(this.formatMessage('TRACE', message)), ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    console.log(chalk.green(this.formatMessage('SUCCESS', message)), ...args);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }
}

// Create a default logger instance
export const logger = new ConsoleLogger();

// Function to update logger configuration
export function configureLogger(options: { verbose?: boolean; level?: LogLevel; timestamp?: boolean } = {}): void {
  const newLogger = new ConsoleLogger(options);
  Object.assign(logger, newLogger);
}

// Mask sensitive information in logs
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  const visible = value.slice(0, visibleChars);
  const hidden = '*'.repeat(value.length - visibleChars);
  return visible + hidden;
}