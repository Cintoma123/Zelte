/**
 * Assertion Built-ins Module
 * Provides reference implementations for built-in operators and accessors
 * 
 * Supported Operators:
 * - Comparison: ==, !=, >, <, >=, <=
 * - Existence: exists
 * - String: contains, matches (regex)
 * 
 * Built-in Accessors:
 * - status: HTTP status code
 * - time: Response time in milliseconds
 * - body: Response body (parsed JSON or string)
 * - headers: Response headers
 * - env: Environment variables
 */

import { HttpResponse, Variables } from '../../types/index';
import { ResponseParser } from '../http/response';
import { logger } from '../../utils/logger';

export type ComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';
export type ExistenceOperator = 'exists' | '!exists';
export type StringOperator = 'contains' | '!contains' | 'matches' | '!matches';
export type AssertionOperator = ComparisonOperator | ExistenceOperator | StringOperator;

export interface AssertionBuiltin {
  name: string;
  operator: AssertionOperator;
  left: any;
  right?: any;
  evaluate(): boolean;
}

export class AssertionBuiltins {
  /**
   * Evaluate comparison operators
   */
  static evaluateComparison(operator: ComparisonOperator, left: any, right: any): boolean {
    const leftNum = Number(left);
    const rightNum = Number(right);

    logger.debug(`[AssertionBuiltins] Compare: ${left} ${operator} ${right}`);

    switch (operator) {
      case '==':
        return left === right || String(left) === String(right);
      case '!=':
        return left !== right && String(left) !== String(right);
      case '>':
        return !isNaN(leftNum) && !isNaN(rightNum) && leftNum > rightNum;
      case '<':
        return !isNaN(leftNum) && !isNaN(rightNum) && leftNum < rightNum;
      case '>=':
        return !isNaN(leftNum) && !isNaN(rightNum) && leftNum >= rightNum;
      case '<=':
        return !isNaN(leftNum) && !isNaN(rightNum) && leftNum <= rightNum;
      default:
        throw new Error(`Unknown comparison operator: ${operator}`);
    }
  }

  /**
   * Evaluate existence operators
   */
  static evaluateExistence(operator: ExistenceOperator, value: any): boolean {
    const exists = ResponseParser.exists(value);

    logger.debug(`[AssertionBuiltins] Existence check: ${operator} -> ${exists}`);

    switch (operator) {
      case 'exists':
        return exists;
      case '!exists':
        return !exists;
      default:
        throw new Error(`Unknown existence operator: ${operator}`);
    }
  }

  /**
   * Evaluate string operators
   */
  static evaluateString(operator: StringOperator, haystack: any, needle: any): boolean {
    logger.debug(`[AssertionBuiltins] String op: ${operator} -> "${haystack}" vs "${needle}"`);

    switch (operator) {
      case 'contains':
        return ResponseParser.contains(haystack, needle);
      case '!contains':
        return !ResponseParser.contains(haystack, needle);
      case 'matches':
        return ResponseParser.matches(haystack, needle);
      case '!matches':
        return !ResponseParser.matches(haystack, needle);
      default:
        throw new Error(`Unknown string operator: ${operator}`);
    }
  }

  /**
   * Get built-in accessor value from response
   */
  static getAccessorValue(accessor: string, response: HttpResponse, env: Variables): any {
    logger.debug(`[AssertionBuiltins] Fetching accessor: ${accessor}`);

    // Status code
    if (accessor === 'status') {
      return response.statusCode;
    }

    // Response time
    if (accessor === 'time') {
      return response.duration;
    }

    // Environment variable
    if (accessor.startsWith('env.')) {
      const envVar = accessor.substring(4);
      return env[envVar];
    }

    // Response body/headers
    return ResponseParser.extractValue(response, accessor);
  }

  /**
   * Build assertion builtin from components
   */
  static build(
    name: string,
    operator: AssertionOperator,
    leftValue: any,
    rightValue?: any
  ): AssertionBuiltin {
    return {
      name,
      operator,
      left: leftValue,
      right: rightValue,
      evaluate(): boolean {
        if (
          operator === '==' ||
          operator === '!=' ||
          operator === '>' ||
          operator === '<' ||
          operator === '>=' ||
          operator === '<='
        ) {
          return AssertionBuiltins.evaluateComparison(
            operator as ComparisonOperator,
            leftValue,
            rightValue
          );
        }

        if (operator === 'exists' || operator === '!exists') {
          return AssertionBuiltins.evaluateExistence(operator as ExistenceOperator, leftValue);
        }

        if (
          operator === 'contains' ||
          operator === '!contains' ||
          operator === 'matches' ||
          operator === '!matches'
        ) {
          return AssertionBuiltins.evaluateString(operator as StringOperator, leftValue, rightValue);
        }

        throw new Error(`Unknown operator: ${operator}`);
      },
    };
  }

  /**
   * Get all supported operators
   */
  static getSupportedOperators(): AssertionOperator[] {
    return [
      '==',
      '!=',
      '>',
      '<',
      '>=',
      '<=',
      'exists',
      '!exists',
      'contains',
      '!contains',
      'matches',
      '!matches',
    ];
  }
}
