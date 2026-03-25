/**
 * Output Formatter Module
 * Simplified to human-readable table and machine-readable JSON
 */

import chalk from 'chalk';

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  error?: string;
  assertions?: {
    name: string;
    passed: boolean;
    error?: string;
  }[];
}

export interface CollectionResult {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

export interface FormatterOptions {
  verbose?: boolean;
  colors?: boolean;
}

export abstract class BaseFormatter {
  protected options: FormatterOptions;

  constructor(options: FormatterOptions = {}) {
    this.options = {
      colors: true,
      verbose: false,
      ...options,
    };
  }

  abstract format(result: CollectionResult): string;

  protected colorStatus(status: string, colors: boolean = true): string {
    if (!colors) return status;
    
    switch (status) {
      case 'passed':
      case 'PASSED':
        return chalk.green('✓ ' + status);
      case 'failed':
      case 'FAILED':
      case 'error':
      case 'ERROR':
        return chalk.red('✗ ' + status);
      case 'skipped':
      case 'SKIPPED':
        return chalk.gray('- ' + status);
      default:
        return status;
    }
  }

  protected formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Pretty Table Formatter (Default)
 * Outputs colorized table format suitable for terminal
 */
export class TableFormatter extends BaseFormatter {
  format(result: CollectionResult): string {
    const lines: string[] = [];
    
    // Header
    lines.push('');
    lines.push(chalk.bold(`Collection: ${result.name}`));
    lines.push('');
    
    // Results table
    lines.push(chalk.gray('Test Results:'));
    lines.push(chalk.gray('─'.repeat(80)));
    
    // Table header
    const header = [
      'ID'.padEnd(25),
      'Name'.padEnd(30),
      'Status'.padEnd(12),
      'Duration'
    ].join(' │ ');
    lines.push(header);
    lines.push(chalk.gray('─'.repeat(80)));
    
    // Table rows
    for (const test of result.tests) {
      const row = [
        chalk.dim(test.id.padEnd(25)),
        test.name.padEnd(30),
        this.colorStatus(test.status.toUpperCase(), this.options.colors).padEnd(12),
        this.formatDuration(test.duration)
      ].join(' │ ');
      lines.push(row);
      
      // Show assertion details if verbose
      if (this.options.verbose && test.assertions) {
        lines.push(chalk.gray('  Assertions:'));
        for (const assertion of test.assertions) {
          const status = assertion.passed 
            ? chalk.green('✓')
            : chalk.red('✗');
          lines.push(chalk.gray(`    ${status} ${assertion.name}`));
          if (!assertion.passed && assertion.error) {
            lines.push(chalk.red(`      Error: ${assertion.error}`));
          }
        }
      }
    }
    
    lines.push(chalk.gray('─'.repeat(80)));
    lines.push('');
    
    // Summary
    const passed = chalk.green(`${result.summary.passed} passed`);
    const failed = result.summary.failed > 0 
      ? chalk.red(`${result.summary.failed} failed`)
      : chalk.dim(`${result.summary.failed} failed`);
    const skipped = result.summary.skipped > 0
      ? chalk.yellow(`${result.summary.skipped} skipped`)
      : chalk.dim(`${result.summary.skipped} skipped`);
    
    lines.push(chalk.bold('Summary:'));
    lines.push(`  ${passed}, ${failed}, ${skipped}`);
    lines.push(`  Total: ${result.summary.total} tests in ${this.formatDuration(result.summary.duration)}`);
    lines.push('');
    
    return lines.join('\n');
  }
}

/**
 * JSON Formatter
 * Outputs machine-readable JSON format for CI/scripting
 */
export class JsonFormatter extends BaseFormatter {
  format(result: CollectionResult): string {
    return JSON.stringify(result, null, 2);
  }
}

/**
 * Formatter Factory
 */
export function createFormatter(
  format: 'table' | 'json' = 'table',
  options: FormatterOptions = {}
): BaseFormatter {
  switch (format) {
    case 'json':
      return new JsonFormatter(options);
    case 'table':
    default:
      return new TableFormatter(options);
  }
}
