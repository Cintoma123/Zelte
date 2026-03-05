/**
 * Advanced Test Filtering
 * Support for multiple filtering strategies and combinations
 */

import { TestCase, GraphQLTestCase } from '../types/index';

export type FilterType = 'regex' | 'glob' | 'tag' | 'status' | 'duration' | 'composite';

export interface FilterCriteria {
  type: FilterType;
  value: string | RegExp | string[];
  negate?: boolean;
}

export interface FilterOptions {
  filters: FilterCriteria[];
  combineWith?: 'AND' | 'OR'; // Default: AND (all filters must match)
}

export class TestFilter {
  private criteria: FilterCriteria[];
  private combineWith: 'AND' | 'OR';

  constructor(options: FilterOptions = { filters: [], combineWith: 'AND' }) {
    this.criteria = options.filters;
    this.combineWith = options.combineWith || 'AND';
  }

  /**
   * Create filter from simple regex pattern
   */
  static fromPattern(pattern: string): TestFilter {
    return new TestFilter({
      filters: [{ type: 'regex', value: new RegExp(pattern, 'i') }],
    });
  }

  /**
   * Create filter from multiple patterns (OR combined)
   */
  static fromPatterns(patterns: string[]): TestFilter {
    return new TestFilter({
      filters: [{ type: 'regex', value: new RegExp(patterns.join('|'), 'i') }],
      combineWith: 'OR',
    });
  }

  /**
   * Create filter from tags
   */
  static fromTags(tags: string[]): TestFilter {
    return new TestFilter({
      filters: [{ type: 'tag', value: tags }],
    });
  }

  /**
   * Filter array of REST tests
   */
  filterTests(tests: TestCase[]): TestCase[] {
    return tests.filter((test) => this.matchesTest(test));
  }

  /**
   * Filter array of GraphQL tests
   */
  filterGraphQLTests(tests: GraphQLTestCase[]): GraphQLTestCase[] {
    return tests.filter((test) => this.matchesGraphQLTest(test));
  }

  /**
   * Check if a REST test matches all filters
   */
  private matchesTest(test: TestCase): boolean {
    if (this.criteria.length === 0) {
      return true;
    }

    const results = this.criteria.map((criterion) => this.matchesCriterion(test, criterion));

    return this.combineWith === 'AND'
      ? results.every((r) => r)
      : results.some((r) => r);
  }

  /**
   * Check if a GraphQL test matches all filters
   */
  private matchesGraphQLTest(test: GraphQLTestCase): boolean {
    if (this.criteria.length === 0) {
      return true;
    }

    const results = this.criteria.map((criterion) => this.matchesGraphQLCriterion(test, criterion));

    return this.combineWith === 'AND'
      ? results.every((r) => r)
      : results.some((r) => r);
  }

  /**
   * Check if a test matches a single criterion
   */
  private matchesCriterion(test: TestCase, criterion: FilterCriteria): boolean {
    let matches = false;

    switch (criterion.type) {
      case 'regex':
        let regex: RegExp;
        if (criterion.value instanceof RegExp) {
          regex = criterion.value;
        } else if (typeof criterion.value === 'string') {
          regex = new RegExp(criterion.value, 'i');
        } else {
          regex = new RegExp(criterion.value.join('|'), 'i');
        }
        matches = regex.test(test.id) || regex.test(test.name);
        break;

      case 'glob':
        matches = this.matchesGlobPattern(test.id, criterion.value as string) ||
                 this.matchesGlobPattern(test.name, criterion.value as string);
        break;

      case 'tag':
        matches = this.hasTag(test, criterion.value as string[]);
        break;

      case 'duration':
        matches = this.matchesDurationFilter(test.timeout || 30000, criterion.value as string);
        break;

      case 'status':
        matches = test.skip === (criterion.value === 'skip');
        break;

      default:
        matches = true;
    }

    return criterion.negate ? !matches : matches;
  }

  /**
   * Check if a GraphQL test matches a single criterion
   */
  private matchesGraphQLCriterion(test: GraphQLTestCase, criterion: FilterCriteria): boolean {
    let matches = false;

    switch (criterion.type) {
      case 'regex':
        let regex: RegExp;
        if (criterion.value instanceof RegExp) {
          regex = criterion.value;
        } else if (typeof criterion.value === 'string') {
          regex = new RegExp(criterion.value, 'i');
        } else {
          regex = new RegExp(criterion.value.join('|'), 'i');
        }
        matches = regex.test(test.id) || regex.test(test.name);
        break;

      case 'glob':
        matches = this.matchesGlobPattern(test.id, criterion.value as string) ||
                 this.matchesGlobPattern(test.name, criterion.value as string);
        break;

      case 'tag':
        matches = this.hasTag(test, criterion.value as string[]);
        break;

      case 'duration':
        matches = this.matchesDurationFilter(test.timeout || 30000, criterion.value as string);
        break;

      case 'status':
        matches = test.skip === (criterion.value === 'skip');
        break;

      default:
        matches = true;
    }

    return criterion.negate ? !matches : matches;
  }

  /**
   * Simple glob pattern matching
   */
  private matchesGlobPattern(str: string, pattern: string): boolean {
    // Convert glob pattern to regex
    // * matches any characters except /
    // ? matches any single character
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(str);
  }

  /**
   * Check if test has specified tags (from description or name)
   */
  private hasTag(test: TestCase | GraphQLTestCase, tags: string[]): boolean {
    const description = test.description || '';
    const name = test.name;

    return tags.some((tag) => {
      const tagPattern = new RegExp(`#${tag}`, 'i');
      return tagPattern.test(name) || tagPattern.test(description);
    });
  }

  /**
   * Match duration filter like "< 500" or ">= 1000"
   */
  private matchesDurationFilter(duration: number, filterStr: string): boolean {
    const match = filterStr.match(/^([<>=!]+)\s*(\d+)$/);
    if (!match) {
      return false;
    }

    const operator = match[1];
    const value = parseInt(match[2], 10);

    switch (operator) {
      case '<':
        return duration < value;
      case '<=':
        return duration <= value;
      case '>':
        return duration > value;
      case '>=':
        return duration >= value;
      case '==':
        return duration === value;
      case '!=':
        return duration !== value;
      default:
        return false;
    }
  }

  /**
   * Parse filter string from CLI argument
   * Supports: pattern, tag:tagname, duration:<500, status:skip
   */
  static parseFilterString(filterStr: string): TestFilter {
    const filters: FilterCriteria[] = [];

    // Split by comma for multiple filters
    const parts = filterStr.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.startsWith('tag:')) {
        filters.push({
          type: 'tag',
          value: [part.substring(4)],
        });
      } else if (part.startsWith('duration:')) {
        filters.push({
          type: 'duration',
          value: part.substring(9),
        });
      } else if (part.startsWith('status:')) {
        filters.push({
          type: 'status',
          value: part.substring(7),
        });
      } else if (part.startsWith('!')) {
        filters.push({
          type: 'regex',
          value: new RegExp(part.substring(1), 'i'),
          negate: true,
        });
      } else if (part.includes('*') || part.includes('?')) {
        filters.push({
          type: 'glob',
          value: part,
        });
      } else {
        // Default to regex
        filters.push({
          type: 'regex',
          value: new RegExp(part, 'i'),
        });
      }
    }

    return new TestFilter({
      filters,
      combineWith: 'AND',
    });
  }

  /**
   * Add a filter criterion
   */
  addFilter(criterion: FilterCriteria): void {
    this.criteria.push(criterion);
  }

  /**
   * Get summary of active filters
   */
  getSummary(): string {
    if (this.criteria.length === 0) {
      return 'No filters applied';
    }

    const descriptions = this.criteria.map((c) => {
      const typeDesc = c.type;
      const valueDesc = c.value instanceof RegExp
        ? c.value.source
        : Array.isArray(c.value)
          ? c.value.join(', ')
          : c.value;

      return `${c.negate ? '!' : ''}${typeDesc}:${valueDesc}`;
    });

    const combineStr = this.combineWith === 'AND' ? ' AND ' : ' OR ';
    return descriptions.join(combineStr);
  }

  /**
   * Get filter criteria
   */
  getCriteria(): FilterCriteria[] {
    return [...this.criteria];
  }

  /**
   * Check if filter is empty
   */
  isEmpty(): boolean {
    return this.criteria.length === 0;
  }
}

export function createFilter(options?: FilterOptions): TestFilter {
  return new TestFilter(options);
}
