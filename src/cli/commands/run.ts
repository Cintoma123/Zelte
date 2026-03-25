import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../../utils/logger';
import { createFormatter } from '../output/formatter';
import { createReportAggregator } from '../output/report';
import { createAndRunTests } from '../../core/runner';
import { autoDetectConfig, autoDetectCollectionPath } from '../../config/auto-detect';
import { loadCollection } from '../../config/loader';
import { Collection } from '../../types/index';

export const runCommand = new Command('run')
  .description('Execute API requests from a collection file (auto-detects configuration)')
  .argument('[collection]', 'path to collection file (auto-detected if omitted)')
  .action(async (collectionPath: string | undefined) => {
    try {
      logger.info('🚀 Zelte - Zero-Config API Testing');

      // STEP 1: Auto-detect configuration
      logger.info('📍 Auto-detecting configuration...');
      const autoConfig = await autoDetectConfig(process.cwd());

      if (autoConfig.configPath) {
        logger.debug(`✓ Config: ${autoConfig.configPath}`);
      }
      if (autoConfig.envPath) {
        logger.debug(`✓ Environment: ${autoConfig.envPath}`);
      }
      logger.debug(`✓ Base URL: ${autoConfig.baseUrl}`);

      // STEP 2: Auto-detect collection file if not provided
      const finalCollectionPath = collectionPath || autoDetectCollectionPath(undefined, process.cwd());
      logger.info(`📂 Collection: ${finalCollectionPath}`);

      // STEP 3: Load collection
      const collection = loadCollection(finalCollectionPath);

      // STEP 4: Merge variables from auto-detected config
      const variables = {
        ...autoConfig.variables,
        ...(collection.variables || {}),
      };

      // Default timeout
      const timeout = 30000;

      // Run tests
      const testCount = (collection.requests || collection.tests || []).length;
      logger.info(`⚡ Running ${testCount} tests...`);
      const testResults = await createAndRunTests(finalCollectionPath, {
        collectionPath: finalCollectionPath,
        variables,
        baseUrl: autoConfig.baseUrl ?? undefined,
        verbose: true,
        parallel: true,
        timeout,
        outputFormat: 'table',
      });

      // Format output (always table format)
      const formatter = createFormatter('table', {
        verbose: true,
        colors: true,
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
      report.name = 'Collection: ' + finalCollectionPath;

      const output = formatter.format(report);
      console.log(output);

      // Exit with appropriate code
      const exitCode = aggregator.hasFailures() ? 1 : 0;
      if (exitCode !== 0) {
        logger.error(`✗ Collection run failed (${aggregator.getFailures().length} failures)`);
      } else {
        logger.success('✓ All tests passed!');
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