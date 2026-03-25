/**
 * Shorthand Syntax Parser
 * Converts compact test syntax to full Collection format
 *
 * SHORTHAND SYNTAX:
 * ```
 * post /auth/login
 * body:
 *   email: test@mail.com
 *   password: 123456
 * expect 200
 * ```
 *
 * CONVERTED TO:
 * ```
 * - id: auth-login-1
 *   name: POST /auth/login
 *   request:
 *     method: POST
 *     url: ${baseUrl}/auth/login
 *     body:
 *       email: test@mail.com
 *       password: 123456
 *   assertions:
 *     - statusCode === 200
 * ```
 */

import { TestCase } from '../types/index';

export interface ShorthandTest {
  method: string;       // GET, POST, PUT, DELETE, etc.
  path: string;         // /endpoint/path
  body?: any;           // Optional request body
  headers?: any;        // Optional headers
  query?: any;          // Optional query parameters
  expect?: number | number[]; // Expected status code(s)
  name?: string;        // Optional test name
  assertions?: string[]; // Additional assertions
}

export class ShorthandParser {
  /**
   * Parse compact HTTP syntax: "POST /auth/login"
   */
  static parseHttpLine(line: string): { method: string; path: string } | null {
    const match = line.trim().match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(\S+)$/i);
    if (!match) return null;
    return {
      method: match[1].toUpperCase(),
      path: match[2],
    };
  }

  /**
   * Convert shorthand test object to full TestCase
   */
  static toTestCase(shorthand: ShorthandTest, baseUrl: string = '${baseUrl}'): TestCase {
    const method = shorthand.method.toUpperCase();
    const path = shorthand.path;
    const url = `${baseUrl}${path}`;
    const testId = `${method.toLowerCase()}-${path.replace(/\//g, '-').slice(1)}`;
    const testName = shorthand.name || `${method} ${path}`;

    // Build assertions
    const assertions: string[] = [];

    // Add status code expectation
    if (shorthand.expect) {
      if (Array.isArray(shorthand.expect)) {
        // Multiple expected status codes
        const codes = shorthand.expect.map(c => `statusCode === ${c}`).join(' || ');
        assertions.push(`(${codes})`);
      } else {
        assertions.push(`statusCode === ${shorthand.expect}`);
      }
    }

    // Add custom assertions
    if (shorthand.assertions) {
      assertions.push(...shorthand.assertions);
    }

    return {
      id: testId,
      name: testName,
      request: {
        method: method as any,
        url,
        ...(shorthand.body && { body: shorthand.body }),
        ...(shorthand.headers && { headers: shorthand.headers }),
        ...(shorthand.query && { query: shorthand.query }),
      },
      assertions: assertions.length > 0 ? assertions : ['statusCode === 200'],
    };
  }

  /**
   * Parse YAML shorthand string blocks
   * Useful for reading from comment blocks in test files
   */
  static parseYamlShorthand(yamlText: string): ShorthandTest[] {
    const tests: ShorthandTest[] = [];
    const lines = yamlText.split('\n');
    let currentTest: Partial<ShorthandTest> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Check for HTTP method line: "GET /path"
      const httpMatch = this.parseHttpLine(line);
      if (httpMatch) {
        if (currentTest) {
          tests.push(currentTest as ShorthandTest);
        }
        currentTest = {
          method: httpMatch.method,
          path: httpMatch.path,
        };
        continue;
      }

      // Only process lines if we have an active test
      if (!currentTest) continue;

      // Parse specific fields
      if (line.startsWith('body:')) {
        // Extract body (simple YAML parsing)
        i++; // Move to next line
        const bodyLines: string[] = [];
        while (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.match(/^\S/) || nextLine.trim() === '') {
            break;
          }
          bodyLines.push(nextLine);
          i++;
        }
        i--; // Adjust for loop increment
        currentTest.body = this.parseYamlObject(bodyLines.join('\n'));
        continue;
      }

      if (line.startsWith('expect')) {
        const match = line.match(/expect\s+([\d\s,]+)/);
        if (match) {
          const codes = match[1].split(',').map(c => parseInt(c.trim()));
          currentTest.expect = codes.length === 1 ? codes[0] : codes;
        }
        continue;
      }

      if (line.startsWith('headers:')) {
        i++;
        const headerLines: string[] = [];
        while (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.match(/^\S/) || nextLine.trim() === '') {
            break;
          }
          headerLines.push(nextLine);
          i++;
        }
        i--;
        currentTest.headers = this.parseYamlObject(headerLines.join('\n'));
        continue;
      }

      if (line.startsWith('assert')) {
        const assertions = currentTest.assertions || [];
        const match = line.match(/assert\s+(.+)/);
        if (match) {
          assertions.push(match[1].trim());
        }
        currentTest.assertions = assertions;
        continue;
      }
    }

    if (currentTest) {
      tests.push(currentTest as ShorthandTest);
    }

    return tests;
  }

  /**
   * Simple YAML object parser for indented key-value pairs
   */
  private static parseYamlObject(yaml: string): any {
    const obj: any = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      // Simple key: value parsing (doesn't handle nested objects)
      const match = line.match(/^\s*(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value: any = match[2].trim();

        // Type conversion
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);
        else if (value.startsWith('"') && value.endsWith('"'))
          value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'"))
          value = value.slice(1, -1);

        obj[key] = value;
      }
    }

    return obj;
  }
}
