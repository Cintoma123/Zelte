/**
 * Configuration Schema Validation
 * Uses Zod for type-safe schema validation
 */

import { z } from 'zod';
import { COLLECTION_VERSION } from '../types/index';

/**
 * Auth Schema
 */
export const AuthSchema = z.object({
  type: z.enum(['bearer', 'api-key', 'basic', 'inherit-from-env']),
  token: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  header: z.string().optional(),
  value: z.string().optional(),
}).strict();

/**
 * HTTP Request Schema
 */
export const RequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  url: z.string().url('Invalid URL format'),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(), // Can be string, object, or null
});

/**
 * Assertion Definition Schema
 */
export const AssertionSchema = z.union([
  z.string(), // Simple string assertion
  z.object({
    name: z.string().optional(),
    assert: z.string(),
    message: z.string().optional(),
  }).strict(),
]);

/**
 * Test Case Schema
 */
export const TestCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  skip: z.boolean().optional(),
  request: RequestSchema,
  auth: AuthSchema.optional(),
  timeout: z.number().positive().optional(),
  assertions: z.array(AssertionSchema),
  expect: z.object({
    variables: z.record(z.string() ,z.string()).optional(),
  }).strict().optional(),
}).strict();

/**
 * GraphQL Test Case Schema
 */
export const GraphQLTestCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  skip: z.boolean().optional(),
  endpoint: z.string().url('Invalid endpoint URL'),
  method: z.enum(['GET', 'POST']).optional().default('POST'),
  query: z.string(),
  variables: z.record(z.any(), z.any()).optional(),
  auth: AuthSchema.optional(),
  timeout: z.number().positive().optional(),
  assertions: z.array(AssertionSchema),
  expect: z.object({
    variables: z.record(z.string(), z.string()).optional(),
  }).strict().optional(),
}).strict();

/**
 * Collection Schema
 */
export const CollectionSchema = z.object({
  version: z.string().default(COLLECTION_VERSION),
  name: z.string(),
  description: z.string().optional(),
  variables: z.record(z.any(), z.any()).optional(),
  tests: z.array(TestCaseSchema).optional(),
  graphql: z.array(GraphQLTestCaseSchema).optional(),
}).strict();

export type Collection = z.infer<typeof CollectionSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;
export type GraphQLTestCase = z.infer<typeof GraphQLTestCaseSchema>;
export type Auth = z.infer<typeof AuthSchema>;

/**
 * Validate collection against schema
 */
export function validateCollection(data: unknown): Collection {
  return CollectionSchema.parse(data);
}

/**
 * Validate test case against schema
 */
export function validateTestCase(data: unknown): TestCase {
  return TestCaseSchema.parse(data);
}

/**
 * Safe validation with detailed error reporting
 */
export function validateCollectionSafe(data: unknown): { 
  success: boolean; 
  data?: Collection; 
  error?: string;
  details?: string[];
} {
  try {
    const collection = validateCollection(data);
    return { success: true, data: collection };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return {
        success: false,
        error: 'Collection validation failed',
        details,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
