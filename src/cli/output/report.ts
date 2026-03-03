/**
 * Report Module
 * Aggregates test results and provides summary statistics
 */

import { TestResult, CollectionResult } from './formatter';

export class ReportAggregator {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  add(result: TestResult): void {
    this.results.push(result);
  }

  addMultiple(results: TestResult[]): void {
    this.results.push(...results);
  }

  getSummary(): CollectionResult {
    const duration = Date.now() - this.startTime;
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      duration,
    };

    return {
      name: 'Collection Results',
      tests: this.results,
      summary,
    };
  }

  reset(): void {
    this.results = [];
    this.startTime = Date.now();
  }

  hasFailures(): boolean {
    return this.results.some(r => r.status === 'failed');
  }

  getFailures(): TestResult[] {
    return this.results.filter(r => r.status === 'failed');
  }

  getPassed(): TestResult[] {
    return this.results.filter(r => r.status === 'passed');
  }

  getSkipped(): TestResult[] {
    return this.results.filter(r => r.status === 'skipped');
  }
}

export function createReportAggregator(): ReportAggregator {
  return new ReportAggregator();
}
