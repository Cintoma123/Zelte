/**
 * Global Type Definitions
 * Core data structures used throughout Zelte
 */

/**
 * Collection Format Version
 */
export const COLLECTION_VERSION = '1.0';

/**
 * HTTP Methods supported
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Authentication Types
 */
export type AuthType = 'bearer' | 'api-key' | 'basic' | 'inherit-from-env';

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  header?: string;
  value?: string;
}

/**
 * Request Headers
 */
export type Headers = Record<string, string | string[]>;

/**
 * Request Body (can be string, object, or binary)
 */
export type RequestBody = string | Record<string, any> | Buffer | null;

/**
 * HTTP Response
 */
export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: string;
  data?: any; // Parsed JSON body
  duration: number; // milliseconds
  timestamp: number; // Unix timestamp
}

/**
 * HTTP Request
 */
export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers?: Headers;
  body?: RequestBody;
  auth?: AuthConfig;
  timeout?: number;
}

/**
 * Assertion Result
 */
export interface AssertionResult {
  name: string;
  passed: boolean;
  error?: string;
  actual?: any;
  expected?: any;
}

/**
 * Test Status
 */
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'pending';

/**
 * Test Execution Result
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

/**
 * Collection Variables
 */
export interface Variables extends Record<string, string | number | boolean | null> {}

/**
 * Test Case (REST)
 */
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  skip?: boolean;
  request: {
    method: HttpMethod;
    url: string;
    headers?: Headers;
    body?: RequestBody;
  };
  auth?: AuthConfig;
  timeout?: number;
  assertions: string[] | AssertionDefinition[];
  expect?: {
    variables?: Record<string, string>;
  };
}

/**
 * GraphQL Test Case
 */
export interface GraphQLTestCase {
  id: string;
  name: string;
  description?: string;
  skip?: boolean;
  endpoint: string;
  method?: HttpMethod;
  query: string;
  variables?: Record<string, any>;
  auth?: AuthConfig;
  timeout?: number;
  assertions: string[] | AssertionDefinition[];
  expect?: {
    variables?: Record<string, string>;
  };
}

/**
 * Assertion Definition
 */
export interface AssertionDefinition {
  name?: string;
  assert: string;
  message?: string;
}

/**
 * Collection Definition
 */
export interface Collection {
  version: string;
  name: string;
  description?: string;
  variables?: Variables;
  tests?: TestCase[];
  graphql?: GraphQLTestCase[];
}

/**
 * Test Execution Context
 */
export interface ExecutionContext {
  variables: Variables;
  previousResults: TestExecution[];
  currentTest?: TestExecution;
}

/**
 * Runner Configuration
 */
export interface RunnerConfig {
  collectionPath: string;
  envName?: string;
  verbose?: boolean;
  parallel?: boolean;
  timeout?: number;
  filter?: string; // regex pattern
  outputFormat?: 'table' | 'json' | 'tap' | 'raw';
  saveResults?: string;
  noColors?: boolean;
}

/**
 * Config Loader Options
 */
export interface ConfigLoaderOptions {
  envFile?: string;
  envName?: string;
  verbose?: boolean;
}
