/**
 * Configuration Schema & Validation - SIMPLIFIED
 * 
 * NO EXTERNAL DEPENDENCIES - No Zod, just TypeScript + logic
 * 
 * DESIGN PATTERNS:
 * 1. Flat validation - checks only required fields
 * 2. Error array return - user sees all problems at once
 * 3. Guard functions - reusable, testable logic
 * 4. Type unions - flexibility without complexity
 */

import { Collection, TestCase, AuthConfig, HttpRequest } from '../types/index';

/**
 * Validation result object
 * PATTERN: Simple { valid, errors } instead of throw/exception
 * Reason: Better UX, can display all errors to user at once
 */
export interface ValidationError {
  valid: boolean;
  errors: string[];
}

/**
 * GUARD FUNCTION: Check if HTTP method is valid
 * Reason: Reusable, single responsibility, easy to test
 */
function isValidHttpMethod(method?: string): boolean {
  if (!method) return true; // Optional
  const valid = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  return valid.includes(method.toUpperCase());
}

/**
 * GUARD FUNCTION: Check if string is valid
 * Reason: Reusable for id, name, url validation
 */
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate single test case
 * PATTERN: Extract complex validation into reusable function
 * 
 * SIMPLIFIED FORMAT: Accepts either
 * 1. Old format: assertions array + id (required)
 * 2. New format: expect.status (simpler) + id (optional)
 */
export function validateTestCase(test: unknown, index: number = 0): ValidationError {
  const errors: string[] = [];
  const prefix = `tests[${index}]`;

  if (!test || typeof test !== 'object') {
    errors.push(`${prefix}: must be an object`);
    return { valid: false, errors };
  }

  const testObj = test as any;

  // Optional: id (auto-generated if missing)
  if (testObj.id && !isValidString(testObj.id)) {
    errors.push(`${prefix}.id: must be a string`);
  }

  // Required: name
  if (!isValidString(testObj.name)) {
    errors.push(`${prefix}.name: required (string)`);
  }

  // Required: request
  if (!testObj.request || typeof testObj.request !== 'object') {
    errors.push(`${prefix}.request: required (object)`);
  } else {
    const req = testObj.request as any;

    // For REST tests: need url
    // For GraphQL tests: need endpoint
    const hasUrl = isValidString(req.url);
    const hasEndpoint = isValidString(req.endpoint);

    if (!hasUrl && !hasEndpoint) {
      errors.push(`${prefix}.request: need 'url' (REST) or 'endpoint' (GraphQL)`);
    }

    // If method is specified, must be valid
    if (req.method && !isValidHttpMethod(req.method)) {
      errors.push(`${prefix}.request.method: invalid HTTP method '${req.method}'`);
    }
  }

  // Either assertions array OR expect.status required
  const hasAssertions = Array.isArray(testObj.assertions) && testObj.assertions.length > 0;
  const hasExpectStatus = testObj.expect && typeof testObj.expect.status === 'number';
  
  if (!hasAssertions && !hasExpectStatus) {
    errors.push(`${prefix}: need either 'assertions' (array) or 'expect.status' (number)`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate entire Collection
 * PATTERN: Collect ALL errors, not just fail on first
 * Reason: User sees full picture of what's wrong
 * 
 * STRATEGY:
 * - Check root level (name required)
 * - If tests exist, validate each one
 * - If errors found, return them all
 */
export function validateCollection(data: unknown): { valid: boolean; data?: Collection; errors: string[] } {
  const errors: string[] = [];

  // Type check
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Collection must be a valid JSON/YAML object']
    };
  }

  const collection = data as any;

  // Required: name
  if (!isValidString(collection.name)) {
    errors.push('name: required (string)');
  }

  // Optional: version
  if (collection.version !== undefined && typeof collection.version !== 'string') {
    errors.push('version: if provided, must be a string');
  }

  // Optional: description
  if (collection.description !== undefined && typeof collection.description !== 'string') {
    errors.push('description: if provided, must be a string');
  }

  // Optional: variables
  if (collection.variables !== undefined && typeof collection.variables !== 'object') {
    errors.push('variables: if provided, must be an object');
  }

  // Optional but if present: tests must be array
  if (collection.tests !== undefined) {
    if (!Array.isArray(collection.tests)) {
      errors.push('tests: if provided, must be an array');
    } else {
      // Validate each test
      collection.tests.forEach((test: unknown, idx: number) => {
        const testValidation = validateTestCase(test, idx);
        if (!testValidation.valid) {
          errors.push(...testValidation.errors);
        }
      });
    }
  }

  // Return result
  if (errors.length === 0) {
    return { valid: true, data: collection as Collection, errors: [] };
  }

  return { valid: false, errors };
}

/**
 * Type Guard: Check if data is valid Collection
 * PATTERN: TypeScript guard for type narrowing
 * Usage: if (isValidCollection(data)) { ... data is Collection ... }
 */
export function isValidCollection(data: unknown): data is Collection {
  const result = validateCollection(data);
  return result.valid;
}
