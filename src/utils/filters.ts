import { TestCase } from '../types/index';

/**
 * Simple test filtering - just regex matching
 * No over-engineering, just what's needed for --filter flag
 */
export class TestFilter {
  private pattern: RegExp;

  constructor(pattern: RegExp) {
    this.pattern = pattern;
  }

  static parseFilterString(filterStr: string): TestFilter {
    return new TestFilter(new RegExp(filterStr, 'i'));
  }

  filterTests(tests: TestCase[]): TestCase[] {
    return tests.filter((test) => this.pattern.test(test.id || '') || this.pattern.test(test.name));
  }
}
