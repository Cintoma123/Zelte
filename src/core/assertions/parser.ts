/**
 * Assertion Parser Module
 * Parses assertion DSL strings into evaluable assertions
 * 
 * Examples:
 * - "status == 200"
 * - "body.id exists"
 * - "body.email matches /^[^\s@]+@[^\s@]+\.[^\s@]+$/"
 * - "headers['Content-Type'] contains 'application/json'"
 * - "time < 500"
 * 
 * Design: Regex-based parser with safe evaluation (no eval())
 */

import {
  AssertionOperator,
  ComparisonOperator,
  ExistenceOperator,
  StringOperator,
} from './builtins';
import { logger } from '../../utils/logger';

export interface ParsedAssertion {
  left: string;
  operator: AssertionOperator;
  right?: string;
  isValid: boolean;
  error?: string;
}

export class AssertionParser {
  /**
   * Operators by precedence
   */
  private static readonly OPERATORS = {
    comparison: ['==', '!=', '>=', '<=', '>', '<'],
    existence: ['!exists', 'exists'], // ! must come before non-negated
    string: ['!contains', '!matches', 'contains', 'matches'],
  };

  /**
   * Parse assertion string into components
   */
  static parse(assertionStr: string): ParsedAssertion {
    const trimmed = assertionStr.trim();
    logger.debug(`[AssertionParser] Parsing: ${trimmed}`);

    if (!trimmed) {
      return {
        left: '',
        operator: '==' as AssertionOperator,
        isValid: false,
        error: 'Empty assertion',
      };
    }

    // Try each operator type
    const comparisonMatch = this.tryComparisonOperators(trimmed);
    if (comparisonMatch) return comparisonMatch;

    const existenceMatch = this.tryExistenceOperators(trimmed);
    if (existenceMatch) return existenceMatch;

    const stringMatch = this.tryStringOperators(trimmed);
    if (stringMatch) return stringMatch;

    return {
      left: trimmed,
      operator: '==' as AssertionOperator,
      isValid: false,
      error: `Unknown assertion format: ${trimmed}`,
    };
  }

  /**
   * Try to match comparison operators (==, !=, >, <, >=, <=)
   */
  private static tryComparisonOperators(str: string): ParsedAssertion | null {
    for (const op of this.OPERATORS.comparison) {
      // Use regex to split by operator, respecting quoted strings
      const regex = new RegExp(`^(.+?)\\s*${this.escapeRegex(op)}\\s*(.+)$`);
      const match = str.match(regex);

      if (match) {
        const [, left, right] = match;
        return {
          left: left.trim(),
          operator: op as ComparisonOperator,
          right: right.trim(),
          isValid: true,
        };
      }
    }

    return null;
  }

  /**
   * Try to match existence operators (exists, !exists)
   */
  private static tryExistenceOperators(str: string): ParsedAssertion | null {
    for (const op of this.OPERATORS.existence) {
      const regex = new RegExp(`^(.+?)\\s+${this.escapeRegex(op)}\\s*$`);
      const match = str.match(regex);

      if (match) {
        const [, left] = match;
        return {
          left: left.trim(),
          operator: op as ExistenceOperator,
          isValid: true,
        };
      }
    }

    return null;
  }

  /**
   * Try to match string operators (contains, matches, !contains, !matches)
   */
  private static tryStringOperators(str: string): ParsedAssertion | null {
    for (const op of this.OPERATORS.string) {
      const regex = new RegExp(`^(.+?)\\s+${this.escapeRegex(op)}\\s+(.+)$`);
      const match = str.match(regex);

      if (match) {
        const [, left, right] = match;
        return {
          left: left.trim(),
          operator: op as StringOperator,
          right: this.parseStringValue(right.trim()),
          isValid: true,
        };
      }
    }

    return null;
  }

  /**
   * Parse string values, handling regex patterns and quoted strings
   * Examples:
   * - /^[0-9]+$/ → (regex pattern)
   * - "hello" → hello
   * - 'world' → world
   * - plain → plain
   */
  private static parseStringValue(value: string): string {
    // Regex pattern: /pattern/
    if (value.startsWith('/') && value.endsWith('/')) {
      return value.slice(1, -1);
    }

    // Double quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/\\"/g, '"');
    }

    // Single quotes
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1).replace(/\\'/g, "'");
    }

    // Plain value
    return value;
  }

  /**
   * Escape regex special characters
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validate parsed assertion
   */
  static validate(parsed: ParsedAssertion): boolean {
    if (!parsed.isValid) {
      return false;
    }

    // Check left operand is not empty
    if (!parsed.left) {
      parsed.error = 'Left operand is empty';
      return false;
    }

    // Check right operand for binary operators
    if (this.isBinaryOperator(parsed.operator) && !parsed.right) {
      parsed.error = `Operator '${parsed.operator}' requires a right operand`;
      return false;
    }

    return true;
  }

  /**
   * Check if operator requires two operands
   */
  private static isBinaryOperator(op: AssertionOperator): boolean {
    return (
      this.OPERATORS.comparison.includes(op as any) ||
      this.OPERATORS.string.includes(op as any)
    );
  }

  /**
   * Parse simple assertion (string or object)
   */
  static parseSimple(assertion: string | { assert: string; name?: string }): {
    assert: string;
    name?: string;
  } {
    if (typeof assertion === 'string') {
      return { assert: assertion };
    }
    return assertion;
  }

  /**
   * Extract variable references from assertion string
   * Examples: ${VAR}, body.prop, env.VAR
   */
  static extractVariableReferences(assertionStr: string): string[] {
    const references = new Set<string>();

    // Find ${VAR_NAME} patterns
    const varPattern = /\$\{([^}]+)\}/g;
    const varMatches = assertionStr.matchAll(varPattern);
    for (const match of varMatches) {
      references.add(match[1]);
    }

    // Find env.VAR patterns
    const envPattern = /\benv\.([a-zA-Z_]\w*)/g;
    const envMatches = assertionStr.matchAll(envPattern);
    for (const match of envMatches) {
      references.add(match[1]);
    }

    return Array.from(references);
  }

  /**
   * Get all supported assertion operators with examples
   */
  static getDocumentation(): Record<string, string> {
    return {
      '==': "Equality - status == 200",
      '!=': "Inequality - status != 404",
      '>': "Greater than - time > 500",
      '<': "Less than - time < 1000",
      '>=': "Greater or equal - status >= 200",
      '<=': "Less or equal - time <= 500",
      exists: "Value exists - body.id exists",
      '!exists': "Value does not exist - body.error !exists",
      contains: "String contains - body.message contains 'success'",
      '!contains': "String does not contain - body.message !contains 'error'",
      matches: "Regex match - body.email matches /^.+@.+\\..+$/",
      '!matches': "Regex does not match - body.id !matches /^[a-z]+$/",
    };
  }
}
