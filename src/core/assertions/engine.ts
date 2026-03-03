/**
 * Assertion Engine
 * Evaluates test assertions against HTTP responses
 */

import { AssertionResult, HttpResponse } from '../../types/index';
import { logger } from '../../utils/logger';

export interface AssertionContext {
  status: number;
  body: any;
  headers: Record<string, string | string[]>;
  time: number;
  data?: any; // Parsed JSON body
}

export class AssertionEngine {
  /**
   * Evaluate all assertions
   */
  evaluateAssertions(
    assertions: (string | { assert: string; name?: string })[],
    response: HttpResponse
  ): AssertionResult[] {
    const context: AssertionContext = {
      status: response.statusCode,
      body: response.data || response.body,
      headers: this.normalizeHeaders(response.headers),
      time: response.duration,
      data: response.data,
    };

    return assertions.map((assertion, index) => {
      const assertStr = typeof assertion === 'string' ? assertion : assertion.assert;
      const name = typeof assertion === 'string' ? assertStr : (assertion.name || assertStr);

      try {
        const result = this.evaluate(assertStr, context);
        return {
          name,
          passed: result,
        };
      } catch (error) {
        return {
          name,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });
  }

  /**
   * Evaluate a single assertion
   */
  private evaluate(assertion: string, context: AssertionContext): boolean {
    assertion = assertion.trim();

    // Parse and evaluate the assertion
    // Supported operators: ==, !=, >, <, >=, <=, exists, contains, matches

    // Handle existence check: "field exists"
    if (assertion.endsWith(' exists')) {
      const field = assertion.slice(0, -7).trim();
      return this.fieldExists(field, context);
    }

    // Handle "does not exist": "field !exists"  
    if (assertion.endsWith(' !exists')) {
      const field = assertion.slice(0, -8).trim();
      return !this.fieldExists(field, context);
    }

    // Handle contains: "field contains value"
    const containsMatch = assertion.match(/^(.+?)\s+contains\s+(.+)$/);
    if (containsMatch) {
      const field = containsMatch[1].trim();
      const value = containsMatch[2].trim();
      const fieldValue = this.getFieldValue(field, context);
      return String(fieldValue).includes(this.stripQuotes(value));
    }

    // Handle regex match: "field matches /regex/"
    const matchesMatch = assertion.match(/^(.+?)\s+matches\s+(.+)$/);
    if (matchesMatch) {
      const field = matchesMatch[1].trim();
      const pattern = matchesMatch[2].trim();
      const fieldValue = this.getFieldValue(field, context);
      
      try {
        const regex = this.parseRegex(pattern);
        return regex.test(String(fieldValue));
      } catch (error) {
        throw new Error(`Invalid regex pattern: ${pattern}`);
      }
    }

    // Handle comparison operators: ==, !=, >, <, >=, <=
    const comparisonMatch = assertion.match(/^(.+?)\s*(==|!=|>|<|>=|<=)\s*(.+)$/);
    if (comparisonMatch) {
      const field = comparisonMatch[1].trim();
      const operator = comparisonMatch[2];
      const expectedStr = comparisonMatch[3].trim();

      const actual = this.getFieldValue(field, context);
      const expected = this.parseValue(expectedStr);

      return this.compare(actual, expected, operator);
    }

    throw new Error(`Invalid assertion syntax: ${assertion}`);
  }

  /**
   * Check if a field exists and is not null/undefined
   */
  private fieldExists(field: string, context: AssertionContext): boolean {
    try {
      const value = this.getFieldValue(field, context);
      return value !== null && value !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Get field value using dot notation
   * Supports: status, time, body.field, headers['Header-Name'], data.nested
   */
  private getFieldValue(field: string, context: AssertionContext): any {
    // Handle special fields
    if (field === 'status') {
      return context.status;
    }
    if (field === 'time') {
      return context.time;
    }

    // Handle body.field notation
    if (field.startsWith('body.')) {
      const path = field.slice(5);
      return this.getNestedValue(context.body, path);
    }

    // Handle data.field notation (alias for parsed JSON)
    if (field.startsWith('data.')) {
      const path = field.slice(5);
      return this.getNestedValue(context.data, path);
    }

    // Handle headers['Header-Name'] or headers.header-name
    if (field.startsWith('headers')) {
      const match = field.match(/headers\[['"]([^'"]+)['"]\]/);
      if (match) {
        const headerName = match[1];
        return context.headers[headerName.toLowerCase()] || context.headers[headerName];
      }
      
      const match2 = field.match(/headers\.(.+)/);
      if (match2) {
        const headerName = match2[1];
        return context.headers[headerName.toLowerCase()] || context.headers[headerName];
      }
    }

    // Direct field access
    return context[field as keyof AssertionContext];
  }

  /**
   * Get nested value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices: data[0]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const field = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        current = current[field];
        if (Array.isArray(current)) {
          current = current[index];
        }
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Compare two values with an operator
   */
  private compare(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case '==':
        return actual == expected;
      case '!=':
        return actual != expected;
      case '>':
        return actual > expected;
      case '<':
        return actual < expected;
      case '>=':
        return actual >= expected;
      case '<=':
        return actual <= expected;
      default:
        return false;
    }
  }

  /**
   * Parse a value (convert strings to proper types)
   */
  private parseValue(value: string): any {
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    // Parse numbers
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Parse booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;

    return value;
  }

  /**
   * Parse regex pattern (e.g., /pattern/flags)
   */
  private parseRegex(pattern: string): RegExp {
    const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
    if (!match) {
      throw new Error('Invalid regex format');
    }
    return new RegExp(match[1], match[2]);
  }

  /**
   * Strip quotes from string
   */
  private stripQuotes(str: string): string {
    if ((str.startsWith('"') && str.endsWith('"')) ||
        (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  }

  /**
   * Normalize headers to lowercase keys
   */
  private normalizeHeaders(headers: Record<string, string | string[]>): Record<string, string | string[]> {
    const normalized: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }
}

export function createAssertionEngine(): AssertionEngine {
  return new AssertionEngine();
}
