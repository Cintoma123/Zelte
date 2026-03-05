/**
 * Variable Scope Management Module
 * Manages variable scope hierarchy and immutable scope chains
 * 
 * Scope Hierarchy (in order of precedence):
 * 1. Test-level variables (highest)
 * 2. Response variables from previous test (inline chaining)
 * 3. Collection-level variables
 * 4. Global/Environment variables (lowest)
 * 
 * Design: Functional approach with immutable scope chains
 */

import { Variables } from '../../types/index';
import { logger } from '../../utils/logger';

export interface VariableScope {
  global: Variables;
  collection: Variables;
  test: Variables;
  response: Variables;
}

export class ScopeManager {
  private scopes: VariableScope;

  constructor(
    globalVariables: Variables = {},
    collectionVariables: Variables = {},
    testVariables: Variables = {},
    responseVariables: Variables = {}
  ) {
    this.scopes = {
      global: { ...globalVariables },
      collection: { ...collectionVariables },
      test: { ...testVariables },
      response: { ...responseVariables },
    };

    logger.debug('[ScopeManager] Initialized scopes', {
      globalVars: Object.keys(globalVariables).length,
      collectionVars: Object.keys(collectionVariables).length,
      testVars: Object.keys(testVariables).length,
      responseVars: Object.keys(responseVariables).length,
    });
  }

  /**
   * Get merged variables across all scopes
   * Scopes are merged with test-level as highest priority
   */
  getMergedVariables(): Variables {
    return {
      ...this.scopes.global,
      ...this.scopes.collection,
      ...this.scopes.response,
      ...this.scopes.test,
    };
  }

  /**
   * Get variable from any scope (respects hierarchy)
   */
  getVariable(name: string): any {
    // Check in order of precedence
    if (name in this.scopes.test) {
      return this.scopes.test[name];
    }
    if (name in this.scopes.response) {
      return this.scopes.response[name];
    }
    if (name in this.scopes.collection) {
      return this.scopes.collection[name];
    }
    if (name in this.scopes.global) {
      return this.scopes.global[name];
    }
    return undefined;
  }

  /**
   * Set variable in test scope
   */
  setTestVariable(name: string, value: any): void {
    this.scopes.test[name] = value;
    logger.debug(`[ScopeManager] Set test variable: ${name} = ${value}`);
  }

  /**
   * Set multiple test variables
   */
  setTestVariables(variables: Variables): void {
    this.scopes.test = { ...this.scopes.test, ...variables };
    logger.debug(`[ScopeManager] Set test variables:`, Object.keys(variables));
  }

  /**
   * Add response variables (from previous test)
   */
  addResponseVariables(variables: Variables): void {
    this.scopes.response = { ...this.scopes.response, ...variables };
    logger.debug(`[ScopeManager] Added response variables:`, Object.keys(variables));
  }

  /**
   * Clear test scope for next test
   */
  clearTestScope(): void {
    this.scopes.test = {};
    logger.debug('[ScopeManager] Cleared test scope');
  }

  /**
   * Get current scope state (for debugging)
   */
  getScopes(): VariableScope {
    return {
      global: { ...this.scopes.global },
      collection: { ...this.scopes.collection },
      test: { ...this.scopes.test },
      response: { ...this.scopes.response },
    };
  }

  /**
   * Create a new scope manager with additional variables
   * Used for test isolation (immutable approach)
   */
  withTestVariables(testVariables: Variables): ScopeManager {
    return new ScopeManager(
      this.scopes.global,
      this.scopes.collection,
      testVariables,
      this.scopes.response
    );
  }

  /**
   * Check if variable exists in any scope
   */
  hasVariable(name: string): boolean {
    return (
      name in this.scopes.test ||
      name in this.scopes.response ||
      name in this.scopes.collection ||
      name in this.scopes.global
    );
  }

  /**
   * Get all available variable names
   */
  getAllVariableNames(): string[] {
    return [
      ...Object.keys(this.scopes.global),
      ...Object.keys(this.scopes.collection),
      ...Object.keys(this.scopes.response),
      ...Object.keys(this.scopes.test),
    ];
  }

  /**
   * Validate that all referenced variables are available
   * Throws error if variable not found
   */
  validateVariableReferences(references: string[]): void {
    const missing = references.filter(ref => !this.hasVariable(ref));

    if (missing.length > 0) {
      throw new Error(
        `[ScopeManager] Missing variables: ${missing.join(', ')}. ` +
        `Available: ${this.getAllVariableNames().join(', ')}`
      );
    }
  }

  /**
   * Create snapshot of current scope state
   */
  snapshot(): VariableScope {
    return JSON.parse(JSON.stringify(this.scopes));
  }

  /**
   * Restore scope from snapshot
   */
  restore(snapshot: VariableScope): void {
    this.scopes = JSON.parse(JSON.stringify(snapshot));
    logger.debug('[ScopeManager] Restored scope from snapshot');
  }
}
