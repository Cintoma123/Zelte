/**
 * Watch Command
 * Monitors collection files for changes and auto-reruns tests
 */

import { Command } from 'commander';
import { watch, FSWatcher } from 'fs';
import chalk from 'chalk';
import path from 'path';
import { logger } from '../../utils/logger';
import { createFormatter } from '../output/formatter';
import { createReportAggregator } from '../output/report';
import { createAndRunTests } from '../../core/runner';
import { ConfigLoader } from '../../config/loader';

interface WatchOptions {
  env?: string;
  output: string;
  timeout?: string;
  parallel?: boolean;
  serial?: boolean;
  filter?: string;
  verbose?: boolean;
  colors: boolean;
  saveResults?: string;
  debounce?: string;
}

class WatchRunner {
  private collectionPath: string;
  private options: WatchOptions;
  private watcher?: FSWatcher;
  private debounceTimer?: NodeJS.Timeout;
  private debounceDelay: number;
  private isRunning: boolean = false;
  private lastRunTime: number = 0;

  constructor(collectionPath: string, options: WatchOptions) {
    this.collectionPath = collectionPath;
    this.options = options;
    this.debounceDelay = parseInt(options.debounce || '500', 10);
  }

  /**
   * Start watching for file changes
   */
  async start(): Promise<void> {
    const fullPath = path.resolve(this.collectionPath);
    const watchDir = path.dirname(fullPath);

    console.log(
      chalk.cyan(`\n📁 Watching for changes in: ${watchDir}`)
    );
    console.log(chalk.gray('Press Ctrl+C to stop\n'));

    // Initial run
    await this.runTests();

    // Watch for file changes
    this.watcher = watch(watchDir, { recursive: true }, (eventType, filename) => {
      if (!filename) {
        return;
      }

      // Check if it's the collection file or .env file
      const changedFile = path.join(watchDir, filename);
      const collectionFile = path.resolve(this.collectionPath);
      const envFiles = [
        path.join(watchDir, '.zelte.env'),
        path.join(watchDir, `.zelte.env.${this.options.env}`),
      ];

      const isRelevantFile =
        changedFile === collectionFile ||
        changedFile === collectionFile.replace('.yaml', '.json') ||
        changedFile === collectionFile.replace('.json', '.yaml') ||
        envFiles.includes(changedFile);

      if (isRelevantFile) {
        logger.info(`File changed: ${filename}`);
        this.scheduleRun();
      }
    });

    // Keep the watcher alive
    await new Promise(() => {
      // Resolve never
    });
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      logger.info('Watch stopped');
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  /**
   * Schedule a test run with debouncing
   */
  private scheduleRun(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.runTests();
    }, this.debounceDelay);
  }

  /**
   * Run tests
   */
  private async runTests(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Tests already running, skipping...');
      return;
    }

    this.isRunning = true;
    const now = Date.now();

    try {
      // Clear screen
      console.clear();

      const timestamp = new Date().toLocaleTimeString();
      console.log(chalk.gray(`Test run started at ${timestamp}`));
      console.log(chalk.cyan('='.repeat(60)));

      const timeout = this.options.timeout ? parseInt(this.options.timeout, 10) : 30000;

      const results = await createAndRunTests(this.collectionPath, {
        collectionPath: this.collectionPath,
        envName: this.options.env,
        verbose: this.options.verbose || false,
        parallel: this.options.parallel ?? !this.options.serial,
        timeout,
        filter: this.options.filter,
        outputFormat: (this.options.output as any) || 'table',
        saveResults: this.options.saveResults,
        noColors: !this.options.colors,
      });

      // Format and display results
      const formatter = createFormatter(this.options.output as any, {
        verbose: this.options.verbose,
        colors: this.options.colors !== false,
      });

      const aggregator = createReportAggregator();
      for (const result of results.results) {
        if (result.status !== 'pending') {
          aggregator.add({
            id: result.id,
            name: result.name,
            status: result.status,
            duration: result.duration,
            error: result.error,
            assertions: result.assertions.map(a => ({
              name: a.name,
              passed: a.passed,
              error: a.error,
            })),
          });
        }
      }

      const report = aggregator.getSummary();
      report.name = 'Collection: ' + path.basename(this.collectionPath);

      const output = formatter.format(report);
      console.log(output);

      // Save results if requested
      if (this.options.saveResults) {
        logger.info(`Results saved to: ${this.options.saveResults}`);
      }

      // Display completion message
      const duration = Date.now() - now;
      const statusEmoji = aggregator.hasFailures() ? '❌' : '✅';
      console.log(chalk.cyan('\n' + '='.repeat(60)));
      console.log(
        `${statusEmoji} Tests completed in ${duration}ms at ${new Date().toLocaleTimeString()}`
      );
      console.log(chalk.gray('Waiting for changes...\n'));

      this.lastRunTime = now;
    } catch (error) {
      const duration = Date.now() - now;
      logger.error(
        'Test execution failed:',
        error instanceof Error ? error.message : String(error)
      );
      console.log(chalk.red(`\n❌ Failed after ${duration}ms`));
      console.log(chalk.gray('Waiting for changes...\n'));
    } finally {
      this.isRunning = false;
    }
  }
}

export const watchCommand = new Command('watch')
  .description('Watch collection file and auto-rerun tests on changes')
  .argument('[collection]', 'path to collection file (*.yaml or *.json)', 'collection.yaml')
  .option('-e, --env <name>', 'environment to use')
  .option('-o, --output <format>', 'output format (table, json, tap)', 'table')
  .option('--timeout <ms>', 'request timeout in milliseconds', '30000')
  .option('--parallel', 'enable parallel request execution')
  .option('--serial', 'run tests sequentially')
  .option('--filter <pattern>', 'regex pattern to filter tests by name or id')
  .option('--debounce <ms>', 'debounce file changes (ms)', '500')
  .option('-v, --verbose', 'verbose output')
  .option('--no-colors', 'disable colored output')
  .option('--save-results <path>', 'save results to file')
  .action(async (collectionPath: string, options: WatchOptions) => {
    try {
      if (options.verbose) {
        logger.setVerbose(true);
      }

      const runner = new WatchRunner(collectionPath, options);

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n\nShutting down watch mode...'));
        runner.stop();
        process.exit(0);
      });

      await runner.start();
    } catch (error) {
      logger.error(
        'Failed to start watch mode:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
