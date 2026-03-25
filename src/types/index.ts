/**
 * Global Type Definitions - SIMPLIFIED
 * Single source of truth for all types across the app
 * 
 * DESIGN: Flat structures, no deep nesting, JSON-friendly
 * PATTERN: Union types for flexibility, optional fields for extensibility
 */

export const COLLECTION_VERSION = '1.0';

// ============================================================================
// PRIMITIVES & ENUMS
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type AuthType = 'bearer' | 'api-key' | 'basic' | 'inherit-from-env';
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'error';

// ============================================================================
// CONFIGURATION & SCHEMA
// ============================================================================

/**
 * Authentication config
 * Supports multiple auth methods in a single clean interface
 */
export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  header?: string;
  value?: string;
}

/**
 * Request type - works for both REST and GraphQL
 * REST example: { method: 'POST', url: '...', body: {...} }
 * GraphQL example: { endpoint: '...', query: '...', variables: {...} }
 */
export interface HttpRequest {
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  body?: string | Record<string, any> | null;
  endpoint?: string;
  query?: string;
  variables?: Record<string, any>;
}

/**
 * Assertion: can be simple string or detailed object
 */
export type Assertion = string | { assert: string; name?: string; message?: string };

/**
 * Test case - unified for REST and GraphQL
 * SIMPLIFIED FORMAT: Cleaner, less boilerplate
 * 
 * Example:
 * {
 *   name: "Login Test",
 *   request: {
 *     method: "POST",
 *     url: "/auth/login",
 *     body: { email: "test@mail.com", password: "123456" }
 *   },
 *   expect: { status: 200 }
 * }
 */
export interface TestCase {
  id?: string; // Optional: auto-generated if not provided
  name: string;
  description?: string;
  skip?: boolean;
  request: HttpRequest;
  auth?: AuthConfig;
  timeout?: number;
  assertions?: Assertion[]; // Optional: use expect.status instead
  expect?: {
    status?: number; // Simple status code expectation
    variables?: Record<string, string>;
  };
}

/**
 * Backward compat alias for GraphQL tests (same structure)
 */
export type GraphQLTestCase = TestCase;

/**
 * Collection: root grouping of tests
 */
export interface Collection {
  version?: string;
  name: string;
  description?: string;
  baseUrl?: string;
  variables?: Record<string, any>;
  requests?: TestCase[]; // alias for tests
  tests?: TestCase[];
}

/**
 * Variables can be any type
 */
export type Variables = Record<string, any>;

// ============================================================================
// EXECUTION & RESULTS
// ============================================================================

/**
 * HTTP Response after execution
 */
export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: string;
  data?: any;
  duration: number;
  timestamp: number;
}

/**
 * Single assertion evaluation result
 */
export interface AssertionResult {
  name: string;
  passed: boolean;
  error?: string;
  actual?: any;
  expected?: any;
}

/**
 * Complete execution result for a test
 */
export interface TestExecution {
  id: string;
  name: string;
  status: TestStatus;
  duration: number;
  request?: HttpRequest;
  response?: HttpResponse;
  assertions: AssertionResult[];
  error?: string;
  startTime: number;
  endTime: number;
}

// ============================================================================
// RUNTIME CONFIGURATION
// ============================================================================

export type Headers = Record<string, string | string[]>;

export type RequestBody = string | Record<string, any> | Buffer | null;

/**
 * CLI runner configuration
 */
export interface RunnerConfig {
  collectionPath: string;
  envName?: string;
  variables?: Record<string, string>;
  baseUrl?: string;
  verbose?: boolean;
  parallel?: boolean;
  timeout?: number;
  filter?: string;
  outputFormat?: 'table' | 'json';
  saveResults?: string;
  noColors?: boolean;
}
