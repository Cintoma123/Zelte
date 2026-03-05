/**
 * Performance Metrics & Detailed Reporting
 * Tracks and aggregates detailed performance data
 */

import { TestExecution } from '../types/index';
import { Timer } from './timing';

export interface PerformanceMetrics {
  totalTests: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  testsByDuration: Array<{ id: string; name: string; duration: number }>;
  slowestTests: Array<{ id: string; name: string; duration: number }>;
  fastestTests: Array<{ id: string; name: string; duration: number }>;
}

export interface DetailedMetrics extends PerformanceMetrics {
  startTime: number;
  endTime: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  failureRate: number;
  skipRate: number;
  throughput: number; // tests per second
  averageAssertions: number;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
}

export class MetricsCollector {
  private results: TestExecution[] = [];
  private timer?: Timer;

  constructor() {
    this.timer = new Timer();
  }

  /**
   * Add test result to metrics
   */
  addResult(result: TestExecution): void {
    this.results.push(result);
  }

  /**
   * Add multiple results
   */
  addResults(results: TestExecution[]): void {
    this.results.push(...results);
  }

  /**
   * Get basic performance metrics
   */
  getMetrics(): PerformanceMetrics {
    if (this.results.length === 0) {
      return {
        totalTests: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        testsByDuration: [],
        slowestTests: [],
        fastestTests: [],
      };
    }

    const durations = this.results.map((r) => r.duration);
    const sortedDurations = [...durations].sort((a, b) => a - b);

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / this.results.length;

    const testsByDuration = this.results
      .map((r) => ({ id: r.id, name: r.name, duration: r.duration }))
      .sort((a, b) => b.duration - a.duration);

    return {
      totalTests: this.results.length,
      totalDuration,
      averageDuration,
      minDuration: sortedDurations[0],
      maxDuration: sortedDurations[sortedDurations.length - 1],
      p50Duration: this.getPercentile(sortedDurations, 50),
      p95Duration: this.getPercentile(sortedDurations, 95),
      p99Duration: this.getPercentile(sortedDurations, 99),
      testsByDuration,
      slowestTests: testsByDuration.slice(0, 10),
      fastestTests: testsByDuration.slice(-10).reverse(),
    };
  }

  /**
   * Get detailed metrics including test results
   */
  getDetailedMetrics(): DetailedMetrics {
    const basicMetrics = this.getMetrics();

    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const total = this.results.length;

    const totalAssertions = this.results.reduce((sum, r) => sum + r.assertions.length, 0);
    const passedAssertions = this.results.reduce(
      (sum, r) => sum + r.assertions.filter((a) => a.passed).length,
      0
    );
    const failedAssertions = totalAssertions - passedAssertions;

    const startTime = Math.min(...this.results.map((r) => r.startTime));
    const endTime = Math.max(...this.results.map((r) => r.endTime));

    return {
      ...basicMetrics,
      startTime,
      endTime,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      skipRate: total > 0 ? (skipped / total) * 100 : 0,
      throughput: basicMetrics.totalDuration > 0
        ? (total / basicMetrics.totalDuration) * 1000
        : 0,
      averageAssertions: total > 0 ? totalAssertions / total : 0,
      totalAssertions,
      passedAssertions,
      failedAssertions,
    };
  }

  /**
   * Get percentile value from sorted array
   */
  private getPercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) {
      return 0;
    }

    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getDetailedMetrics();

    const lines: string[] = [];

    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║                   PERFORMANCE METRICS REPORT                 ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');

    // Summary Section
    lines.push('📊 TEST SUMMARY');
    lines.push('─'.repeat(60));
    lines.push(`Total Tests:       ${metrics.totalTests}`);
    lines.push(`  ✓ Passed:        ${metrics.passed} (${metrics.passRate.toFixed(2)}%)`);
    lines.push(`  ✗ Failed:        ${metrics.failed} (${metrics.failureRate.toFixed(2)}%)`);
    lines.push(`  ⊘ Skipped:       ${metrics.skipped} (${metrics.skipRate.toFixed(2)}%)`);
    lines.push('');

    // Timing Section
    lines.push('⏱️  TIMING METRICS');
    lines.push('─'.repeat(60));
    lines.push(`Total Duration:    ${metrics.totalDuration}ms`);
    lines.push(`Average Duration:  ${metrics.averageDuration.toFixed(2)}ms`);
    lines.push(`Min Duration:      ${metrics.minDuration}ms`);
    lines.push(`Max Duration:      ${metrics.maxDuration}ms`);
    lines.push(`Throughput:        ${metrics.throughput.toFixed(2)} tests/sec`);
    lines.push('');

    // Percentiles Section
    lines.push('📈 RESPONSE TIME PERCENTILES');
    lines.push('─'.repeat(60));
    lines.push(`P50 (Median):      ${metrics.p50Duration.toFixed(2)}ms`);
    lines.push(`P95:               ${metrics.p95Duration.toFixed(2)}ms`);
    lines.push(`P99:               ${metrics.p99Duration.toFixed(2)}ms`);
    lines.push('');

    // Assertions Section
    lines.push('🔍 ASSERTION METRICS');
    lines.push('─'.repeat(60));
    lines.push(`Total Assertions:  ${metrics.totalAssertions}`);
    lines.push(`Passed:            ${metrics.passedAssertions}`);
    lines.push(`Failed:            ${metrics.failedAssertions}`);
    lines.push(`Avg per Test:      ${metrics.averageAssertions.toFixed(2)}`);
    lines.push('');

    // Slowest Tests Section
    if (metrics.slowestTests.length > 0) {
      lines.push('🐢 SLOWEST TESTS');
      lines.push('─'.repeat(60));
      for (let i = 0; i < Math.min(5, metrics.slowestTests.length); i++) {
        const test = metrics.slowestTests[i];
        lines.push(`  ${i + 1}. ${test.name} (${test.id}) - ${test.duration}ms`);
      }
      lines.push('');
    }

    // Fastest Tests Section
    if (metrics.fastestTests.length > 0) {
      lines.push('🚀 FASTEST TESTS');
      lines.push('─'.repeat(60));
      for (let i = 0; i < Math.min(5, metrics.fastestTests.length); i++) {
        const test = metrics.fastestTests[i];
        lines.push(`  ${i + 1}. ${test.name} (${test.id}) - ${test.duration}ms`);
      }
      lines.push('');
    }

    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Get JSON report
   */
  getJSONReport(): DetailedMetrics {
    return this.getDetailedMetrics();
  }

  /**
   * Get CSV report
   */
  getCSVReport(): string {
    const headers = ['Test ID', 'Test Name', 'Duration (ms)', 'Status', 'Assertions'];
    const rows = this.results.map((r) => [
      r.id,
      r.name,
      r.duration.toString(),
      r.status,
      r.assertions.length.toString(),
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.results = [];
    this.timer = new Timer();
  }

  /**
   * Get number of results collected
   */
  getResultCount(): number {
    return this.results.length;
  }
}

export function createMetricsCollector(): MetricsCollector {
  return new MetricsCollector();
}
