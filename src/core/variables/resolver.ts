/**
 * Variable Resolution Engine
 * Handles ${VAR_NAME} substitution with scope hierarchy
 */

import { Variables, TestExecution } from '../../types/index';
import { logger } from '../../utils/logger';

export interface VariableScope {
  global: Variables;
  collection: Variables;
  test: Variables;
  response: Variables;
}

export class VariableResolver {
  private scopes: VariableScope;
  private previousResults: TestExecution[] = [];

  constructor(
    globalVars: Variables = {},
    collectionVars: Variables = {},
    testVars: Variables = {}
  ) {
    this.scopes = {
      global: globalVars,
      collection: collectionVars,
      test: testVars,
      response: {},
    };
  }

  /**
   * Resolve a string with variable substitution
   * Pattern: ${VAR_NAME} or ${prev.field} (for previous test response)
   */
  resolve(input: string | any): any {
    // Handle non-string inputs
    if (typeof input !== 'string') {
      return input;
    }

    // Find all variable patterns
    const pattern = /\$\{([^}]+)\}/g;
    let result = input;
    let match;
    const matches: Array<{ full: string; path: string }> = [];

    // Collect all matches first
    while ((match = pattern.exec(input)) !== null) {
      matches.push({
        full: match[0],
        path: match[1],
      });
    }

    // Replace each match
    for (const { full, path } of matches) {
      const value = this.resolveVariable(path);
      
      if (value === undefined) {
        throw new Error(`Variable not found: ${full}`);
      }

      result = result.replace(full, String(value));
    }

    return result;
  }

  /**
   * Resolve a single variable reference
   * Supports:
   * - Simple vars: VAR_NAME
   * - Previous response: prev.field or prev.data.nested
   * - Object paths: var.field.nested
   */
  private resolveVariable(path: string): any {
    const parts = path.split('.');

    // Handle previous test response: prev.field
    if (parts[0] === 'prev') {
      if (this.previousResults.length === 0) {
        return undefined;
      }

      const lastResult = this.previousResults[this.previousResults.length - 1];
      if (!lastResult.response?.data) {
        return undefined;
      }

      // Navigate to nested property
      let current: any = lastResult.response.data;
      for (let i = 1; i < parts.length; i++) {
        if (current === null || current === undefined) {
          return undefined;
        }
        current = current[parts[i]];
      }

      return current;
    }

    // Handle regular variables with scope hierarchy
    const varName = parts[0];
    let value: any;

    // Priority order: test > collection > global
    if (varName in this.scopes.test) {
      value = this.scopes.test[varName];
    } else if (varName in this.scopes.collection) {
      value = this.scopes.collection[varName];
    } else if (varName in this.scopes.global) {
      value = this.scopes.global[varName];
    } else {
      return undefined;
    }

    // Navigate nested properties
    for (let i = 1; i < parts.length; i++) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[parts[i]];
    }

    return value;
  }

  /**
   * Resolve object recursively
   */
  resolveObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.resolve(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveObject(value);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * Set variables from a response
   */
  setResponseVariables(extraction: Record<string, string>, response: any): void {
    if (!response) {
      return;
    }

    for (const [varName, jsonPath] of Object.entries(extraction)) {
      // Simple JSON path support (e.g., "data.id")
      const parts = jsonPath.split('.');
      let value: any = response;

      for (const part of parts) {
        if (value === null || value === undefined) {
          break;
        }
        value = value[part];
      }

      if (value !== undefined) {
        this.scopes.test[varName] = value;
        logger.debug(`Extracted variable: ${varName} = ${value}`);
      }
    }
  }

  /**
   * Add previous test result for reference
   */
  addPreviousResult(result: TestExecution): void {
    this.previousResults.push(result);
  }

  /**
   * Get all resolved variables
   */
  getVariables(): Variables {
    return {
      ...this.scopes.global,
      ...this.scopes.collection,
      ...this.scopes.test,
    };
  }

  /**
   * Reset test-level variables
   */
  resetTestVariables(): void {
    this.scopes.test = {};
  }
}

export function createVariableResolver(
  globalVars?: Variables,
  collectionVars?: Variables,
  testVars?: Variables
): VariableResolver {
  return new VariableResolver(globalVars, collectionVars, testVars);
}
