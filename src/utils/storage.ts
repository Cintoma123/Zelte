/**
 * Test Persistence / Storage
 * Saves and loads test results and collections to/from disk
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { logger } from './logger';
import { TestExecution, Collection } from '../types/index';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

export interface StorageOptions {
  directory?: string;
  format?: 'json' | 'yaml';
  pretty?: boolean;
}

const DEFAULT_STORAGE_DIR = '.zelte-results';

export class TestResultsStorage {
  private directory: string;
  private format: 'json' | 'yaml';
  private pretty: boolean;

  constructor(options: StorageOptions = {}) {
    this.directory = options.directory || DEFAULT_STORAGE_DIR;
    this.format = options.format || 'json';
    this.pretty = options.pretty !== false;
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await stat(this.directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await mkdir(this.directory, { recursive: true });
        logger.debug(`Created results directory: ${this.directory}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Save test results to file
   */
  async saveResults(collectionName: string, results: TestExecution[]): Promise<string> {
    try {
      await this.ensureDirectory();

      const timestamp = new Date().toISOString();
      const sanitizedName = collectionName.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${sanitizedName}-${dateStr}-${Date.now()}.json`;
      const filePath = path.join(this.directory, fileName);

      const data = {
        collectionName,
        timestamp,
        totalTests: results.length,
        passed: results.filter((r) => r.status === 'passed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        skipped: results.filter((r) => r.status === 'skipped').length,
        duration: results.reduce((sum, r) => sum + r.duration, 0),
        results,
      };

      const content = this.pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

      await writeFile(filePath, content, 'utf8');
      logger.info(`Test results saved to: ${filePath}`);

      return filePath;
    } catch (error) {
      logger.error(
        'Failed to save test results:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Save results to specified file path
   */
  async saveToFile(filePath: string, results: TestExecution[]): Promise<void> {
    try {
      const dir = path.dirname(filePath);

      if (dir !== '.' && dir !== '') {
        await mkdir(dir, { recursive: true });
      }

      const data = {
        timestamp: new Date().toISOString(),
        totalTests: results.length,
        passed: results.filter((r) => r.status === 'passed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        skipped: results.filter((r) => r.status === 'skipped').length,
        duration: results.reduce((sum, r) => sum + r.duration, 0),
        results,
      };

      const content = this.pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

      await writeFile(filePath, content, 'utf8');
      logger.info(`Results saved to: ${filePath}`);
    } catch (error) {
      logger.error(
        'Failed to save results to file:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Load test results from file
   */
  async loadResults(filePath: string): Promise<TestExecution[]> {
    try {
      const content = await readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data.results)) {
        return data.results;
      }

      throw new Error('Invalid results file format');
    } catch (error) {
      logger.error(
        'Failed to load results:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * List all saved results
   */
  async listResults(): Promise<Array<{ path: string; name: string; date: string }>> {
    try {
      await this.ensureDirectory();

      const files = fs.readdirSync(this.directory);
      const results: Array<{ path: string; name: string; date: string }> = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.directory, file);
          results.push({
            path: filePath,
            name: file,
            date: new Date(fs.statSync(filePath).mtime).toISOString(),
          });
        }
      }

      return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      logger.error(
        'Failed to list results:',
        error instanceof Error ? error.message : String(error)
      );
      return [];
    }
  }

  /**
   * Delete old results (older than specified days)
   */
  async cleanOldResults(olderThanDays: number = 7): Promise<number> {
    try {
      const allResults = await this.listResults();
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const result of allResults) {
        if (new Date(result.date).getTime() < cutoffTime) {
          fs.unlinkSync(result.path);
          deletedCount++;
          logger.debug(`Deleted old results: ${result.name}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old result file(s)`);
      }

      return deletedCount;
    } catch (error) {
      logger.error(
        'Failed to clean old results:',
        error instanceof Error ? error.message : String(error)
      );
      return 0;
    }
  }

  /**
   * Save collection to file
   */
  async saveCollection(filePath: string, collection: Collection): Promise<void> {
    try {
      const dir = path.dirname(filePath);

      if (dir !== '.' && dir !== '') {
        await mkdir(dir, { recursive: true });
      }

      const content = this.pretty
        ? JSON.stringify(collection, null, 2)
        : JSON.stringify(collection);

      await writeFile(filePath, content, 'utf8');
      logger.info(`Collection saved to: ${filePath}`);
    } catch (error) {
      logger.error(
        'Failed to save collection:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Load collection from file
   */
  async loadCollection(filePath: string): Promise<Collection> {
    try {
      const content = await readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      return data as Collection;
    } catch (error) {
      logger.error(
        'Failed to load collection:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Export results in different formats
   */
  async exportResults(
    results: TestExecution[],
    outputPath: string,
    format: 'json' | 'csv' | 'html' = 'json'
  ): Promise<void> {
    try {
      const dir = path.dirname(outputPath);

      if (dir !== '.' && dir !== '') {
        await mkdir(dir, { recursive: true });
      }

      let content: string;

      switch (format) {
        case 'csv':
          content = this.resultsToCSV(results);
          break;

        case 'html':
          content = this.resultsToHTML(results);
          break;

        case 'json':
        default:
          content = this.pretty
            ? JSON.stringify(results, null, 2)
            : JSON.stringify(results);
      }

      await writeFile(outputPath, content, 'utf8');
      logger.info(`Results exported to: ${outputPath}`);
    } catch (error) {
      logger.error(
        'Failed to export results:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Convert results to CSV
   */
  private resultsToCSV(results: TestExecution[]): string {
    const headers = ['ID', 'Name', 'Status', 'Duration (ms)', 'Assertions', 'Error'];
    const rows = results.map((r) => [
      r.id,
      r.name,
      r.status,
      r.duration,
      r.assertions.filter((a) => !a.passed).length + '/' + r.assertions.length,
      r.error || '',
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  /**
   * Convert results to HTML
   */
  private resultsToHTML(results: TestExecution[]): string {
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary h1 { margin: 0 0 10px 0; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .stat { padding: 10px; border-radius: 4px; text-align: center; }
    .stat-pass { background: #d4edda; }
    .stat-fail { background: #f8d7da; }
    .stat-skip { background: #e2e3e5; }
    .stat-total { background: #d1ecf1; }
    .results { background: white; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f0f0; padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #fafafa; }
    .passed { color: #28a745; font-weight: bold; }
    .failed { color: #dc3545; font-weight: bold; }
    .skipped { color: #6c757d; font-weight: bold; }
  </style>
</head>
<body>
  <div class="summary">
    <h1>Test Results</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <div class="stats">
      <div class="stat stat-total">
        <div style="font-size: 24px; font-weight: bold;">${results.length}</div>
        <div style="font-size: 12px; color: #666;">Total Tests</div>
      </div>
      <div class="stat stat-pass">
        <div style="font-size: 24px; font-weight: bold;">${passed}</div>
        <div style="font-size: 12px; color: #155724;">Passed</div>
      </div>
      <div class="stat stat-fail">
        <div style="font-size: 24px; font-weight: bold;">${failed}</div>
        <div style="font-size: 12px; color: #721c24;">Failed</div>
      </div>
      <div class="stat stat-skip">
        <div style="font-size: 24px; font-weight: bold;">${skipped}</div>
        <div style="font-size: 12px; color: #383d41;">Skipped</div>
      </div>
    </div>
    <p>Total Duration: <strong>${totalDuration}ms</strong></p>
  </div>

  <div class="results">
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Assertions</th>
        </tr>
      </thead>
      <tbody>
        ${results
          .map(
            (r) => `
        <tr>
          <td><code>${r.id}</code></td>
          <td>${r.name}</td>
          <td><span class="${r.status}">${r.status.toUpperCase()}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.assertions.length}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Get statistics from results
   */
  getStatistics(results: TestExecution[]): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    totalDuration: number;
    averageDuration: number;
  } {
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const total = results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      totalDuration,
      averageDuration: total > 0 ? totalDuration / total : 0,
    };
  }
}

export function createTestResultsStorage(options?: StorageOptions): TestResultsStorage {
  return new TestResultsStorage(options);
}
