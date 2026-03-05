import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../../utils/logger';
import { createFormatter } from '../output/formatter';
import { createReportAggregator } from '../output/report';
import { createAndRunTests } from '../../core/runner';
import { createTestResultsStorage } from '../../utils/storage';
import { createMetricsCollector } from '../../utils/metrics';

export const runCommand = new Command('run')
  .description('Execute API requests from a collection file (YAML or JSON)')
  .argument('[collection]', 'path to collection file (*.yaml or *.json)', 'collection.yaml')
  .option('-e, --env <name>', 'environment to use')
  .option('-o, --output <format>', 'output format (table, json, tap, raw)', 'table')
  .option('--timeout <ms>', 'request timeout in milliseconds', '30000')
  .option('--parallel', 'enable parallel request execution')
  .option('--serial', 'run tests sequentially (opposite of --parallel)')
  .option('--filter <pattern>', 'regex pattern to filter tests by name or id')
  .option('-v, --verbose', 'verbose output with request/response details')
  .option('--metrics', 'show detailed performance metrics')
  .option('--no-colors', 'disable colored output')
  .option('--save-results <path>', 'save results to file')
  .action(async (collectionPath: string, options: any) => {
    try {
      // Configure logger based on options
      if (options.verbose) {
        logger.setVerbose(true);
      }

      logger.info(`Running collection: ${collectionPath}`);
      logger.debug('Options:', options);

      // Parse timeout
      const timeout = options.timeout ? parseInt(options.timeout, 10) : 30000;

      // Run tests
      const testResults = await createAndRunTests(collectionPath, {
        collectionPath,
        envName: options.env,
        verbose: options.verbose || false,
        parallel: options.parallel ?? !options.serial,
        timeout,
        filter: options.filter,
        outputFormat: (options.output as any) || 'table',
        saveResults: options.saveResults,
        noColors: !options.colors,
      });

      // Format output
      const formatter = createFormatter(options.output as any, {
        verbose: options.verbose,
        colors: options.colors !== false,
      });

      const aggregator = createReportAggregator();
      for (const result of testResults.results) {
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

      const report = aggregator.getSummary();
      report.name = 'Collection: ' + collectionPath;

      const output = formatter.format(report);
      console.log(output);

      // Show performance metrics
      const metricsCollector = createMetricsCollector();
      metricsCollector.addResults(testResults.results);
      if (options.verbose || options.metrics) {
        console.log(metricsCollector.generateReport());
      }

      // Save results if requested
      if (options.saveResults) {
        const storage = createTestResultsStorage();
        try {
          await storage.saveToFile(options.saveResults, testResults.results);
        } catch (error) {
          logger.error(
            'Failed to save results:',
            error instanceof Error ? error.message : String(error)
          );
        }
      }

      // Exit with appropriate code
      const exitCode = aggregator.hasFailures() ? 1 : 0;
      if (exitCode !== 0) {
        logger.error(`Collection run failed (${aggregator.getFailures().length} failures)`);
      } else {
        logger.success('Collection execution completed successfully');
      }

      process.exit(exitCode);
    } catch (error) {
      logger.error(
        'Failed to run collection:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });