/**
 * Test Runner / Orchestrator
 * Manages test execution flow and coordination
 */

import { Collection, TestExecution, TestCase, RunnerConfig, Variables } from '../types/index';
import { HttpClient } from './http/client';
import { AssertionEngine } from './assertions/engine';
import { VariableResolver } from './variables/resolver';
import { ConfigLoader } from '../config/loader';
import { logger } from '../utils/logger';
import { validateCollection } from '../config/schema';

export class TestRunner {
  private collection: Collection;
  private config: RunnerConfig;
  private httpClient: HttpClient;
  private assertionEngine: AssertionEngine;
  private variableResolver: VariableResolver;
  private configLoader: ConfigLoader;
  private results: TestExecution[] = [];

  constructor(
    collection: Collection,
    config: RunnerConfig,
    configLoader: ConfigLoader
  ) {
    this.collection = collection;
    this.config = config;
    this.configLoader = configLoader;
    this.httpClient = new HttpClient(config.timeout || 30000);
    this.assertionEngine = new AssertionEngine();

    // Setup variable resolver with hierarchy
    const envVars = configLoader.getEnvironmentVariables();
    const collectionVars = collection.variables || {};

    this.variableResolver = new VariableResolver(envVars, collectionVars);
  }

  /**
   * Execute all tests in the collection
   */
  async run(): Promise<TestExecution[]> {
    try {
      const tests = this.getTestsToRun();

      if (tests.length === 0) {
        logger.warn('No tests found to run');
        return [];
      }

      logger.info(`Running ${tests.length} test(s)...`);

      // Execute tests serially or in parallel
      const testPromises = tests.map((test) => this.runTest(test));
      const results = await Promise.all(testPromises);

      this.results = results.filter((r) => r !== null) as TestExecution[];

      return this.results;
    } catch (error) {
      logger.error('Test execution failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Execute a single test
   */
  private async runTest(test: TestCase): Promise<TestExecution | null> {
    const startTime = Date.now();

    try {
      // Skip if marked
      if (test.skip) {
        logger.info(`⊘ SKIP: ${test.name}`);
        return {
          id: test.id,
          name: test.name,
          status: 'skipped',
          duration: 0,
          assertions: [],
          startTime,
          endTime: Date.now(),
        };
      }

      logger.info(`Running: ${test.name}`);

      // Resolve request variables
      const request = this.variableResolver.resolveObject(test.request);

      // Build and execute request
      const response = await this.httpClient.execute(request);

      // Run assertions
      const assertions = this.assertionEngine.evaluateAssertions(
        test.assertions,
        response
      );

      // Check if all assertions passed
      const passed = assertions.every((a) => a.passed);

      // Extract variables for next test
      if (test.expect?.variables && passed) {
        this.variableResolver.setResponseVariables(
          test.expect.variables,
          response.data || JSON.parse(response.body)
        );
      }

      const result: TestExecution = {
        id: test.id,
        name: test.name,
        status: passed ? 'passed' : 'failed',
        duration: response.duration,
        request,
        response,
        assertions,
        startTime,
        endTime: Date.now(),
      };

      // Log result
      if (passed) {
        logger.info(`✓ PASS: ${test.name}`);
      } else {
        const failures = assertions.filter((a) => !a.passed);
        logger.error(`✗ FAIL: ${test.name}`);
        for (const failure of failures) {
          logger.error(`  - ${failure.name}: ${failure.error || 'Assertion failed'}`);
        }
      }

      // Add to previous results for variable references
      this.variableResolver.addPreviousResult(result);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      logger.error(`✗ ERROR: ${test.name} - ${errorMsg}`);

      return {
        id: test.id,
        name: test.name,
        status: 'failed',
        duration,
        error: errorMsg,
        assertions: [],
        startTime,
        endTime,
      };
    }
  }

  /**
   * Get tests to run based on filter
   */
  private getTestsToRun(): TestCase[] {
    let tests = this.collection.tests || [];

    if (this.config.filter) {
      try {
        const regex = new RegExp(this.config.filter, 'i');
        tests = tests.filter((t) => regex.test(t.id) || regex.test(t.name));
        logger.info(`Filtered to ${tests.length} test(s) matching: ${this.config.filter}`);
      } catch (error) {
        logger.warn(`Invalid filter pattern: ${this.config.filter}`);
      }
    }

    return tests;
  }

  /**
   * Get execution results
   */
  getResults(): TestExecution[] {
    return this.results;
  }

  /**
   * Get test summary
   */
  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return { total, passed, failed, skipped, duration };
  }
}

export async function createAndRunTests(
  collectionPath: string,
  config: RunnerConfig
): Promise<{
  results: TestExecution[];
  summary: ReturnType<TestRunner['getSummary']>;
}> {
  const configLoader = new ConfigLoader({
    envName: config.envName,
  });

  const collection = configLoader.loadCollection(collectionPath);
  const validated = validateCollection(collection) as Collection;

  const runner = new TestRunner(validated, config, configLoader);
  const results = await runner.run();

  return {
    results,
    summary: runner.getSummary(),
  };
}
