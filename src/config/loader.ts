/**
 * Configuration Loader - SIMPLIFIED
 * 
 * SIMPLIFIED APPROACH:
 * - No classes, just functions
 * - Each function does ONE thing
 * - Direct input → output
 * - Easy to test, easy to use
 * 
 * This matches how Postman/Insomnia work:
 * 1. Load file → returns data
 * 2. Load env → returns variables
 * 3. Merge → combines variables
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { Collection, Variables } from '../types/index';
import { logger } from '../utils/logger';

/**
 * REASON for function approach over class:
 * - No state management needed
 * - Easier to test (pure functions)
 * - Easier to understand (same as function calls)
 * - Matches Postman/Insomnia pattern
 */

/**
 * Parse .env file format (KEY=VALUE lines)
 * PATTERN: String → Record<string, string>
 * 
 * REASON: Extracted as standalone function
 * - Called by loadEnvFile()
 * - Can be tested independently
 * - Can be reused elsewhere
 * 
 * @example
 * parseEnvContent("API_KEY=secret\nDEBUG=true")
 * // Returns: { API_KEY: "secret", DEBUG: "true" }
 */
export function parseEnvContent(content: string): Record<string, string> {
  const vars: Record<string, string> = {};

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Split on first = only (handles values with = in them)
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue; // Skip malformed lines

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    // Remove surrounding quotes
    const unquoted = value.replace(/^["']|["']$/g, '');

    vars[key] = unquoted;
  }

  return vars;
}

/**
 * Load environment file (.zelte.env)
 * PATTERN: File path → Record<string, string>
 * 
 * REASON: Simple wrapper around parseEnvContent
 * - Handles file not found gracefully
 * - Returns empty object if file missing (env is optional)
 * 
 * @example
 * loadEnvFile('.zelte.env') // Returns { API_KEY: "...", ... }
 * loadEnvFile('.zelte.env.missing') // Returns {} (no error)
 */
export function loadEnvFile(filePath: string = '.zelte.env'): Record<string, string> {
  try {
    const content = readFileSync(resolve(filePath), 'utf-8');
    logger.debug(`Loaded .env file: ${filePath}`);
    return parseEnvContent(content);
  } catch (error) {
    // .env files are optional - missing file is not an error
    logger.debug(`Environment file not found: ${filePath}`);
    return {};
  }
}

/**
 * Load YAML or JSON file
 * PATTERN: File path → any (parsed)
 * 
 * REASON: Works for both formats transparently
 * - Detects format from extension
 * - Throws on parse errors (files are required)
 * 
 * @example
 * loadFile('collection.yaml') // Parses YAML
 * loadFile('collection.json') // Parses JSON
 */
export function loadFile(filePath: string): any {
  try {
    const content = readFileSync(resolve(filePath), 'utf-8');

    // Detect format from extension
    const isJson = filePath.toLowerCase().endsWith('.json');

    if (isJson) {
      try {
        const parsed = JSON.parse(content);
        logger.debug(`Loaded JSON file: ${filePath}`);
        return parsed;
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in '${filePath}': ${
            parseError instanceof Error ? parseError.message : String(parseError)
          }`
        );
      }
    } else {
      // Assume YAML (.yaml, .yml, or unknown)
      try {
        const parsed = YAML.parse(content);
        logger.debug(`Loaded YAML file: ${filePath}`);
        return parsed;
      } catch (parseError) {
        throw new Error(
          `Invalid YAML in '${filePath}': ${
            parseError instanceof Error ? parseError.message : String(parseError)
          }`
        );
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load '${filePath}': ${message}`);
  }
}

/**
 * Load collection file as Collection type
 * PATTERN: File path → Collection
 * 
 * REASON: Wrapper around loadFile for type safety
 * - Just calls loadFile() with better type hint
 * 
 * @example
 * const collection = loadCollection('collection.yaml');
 */
export function loadCollection(filePath: string): Collection {
  return loadFile(filePath) as Collection;
}

/**
 * Merge multiple variable sets
 * PATTERN: ...Record[] → Record
 * 
 * REASON: Simple Object.assign with sensible priority
 * - System env (process.env) has lowest priority
 * - Each varSet overrides previous
 * 
 * @example
 * mergeVariables(systemVars, collectionVars, testVars)
 * // Result: testVars overwrites collectionVars overwrites systemVars
 */
export function mergeVariables(...varSets: (Variables | undefined)[]): Variables {
  return varSets.reduce<Variables>((merged, vars) => {
    if (vars) {
      Object.assign(merged, vars);
    }
    return merged;
  }, {});
}

/**
 * Get single variable from multiple sources with priority
 * PATTERN: key + varSets → value
 * 
 * REASON: Convenience wrapper for common case
 * - Checks process.env first
 * - Then each varSet in order
 * - Returns undefined if not found
 * 
 * @example
 * getVariable('API_KEY', envVars, collectionVars, testVars)
 */
export function getVariable(
  key: string,
  ...varSets: Variables[]
): string | undefined {
  // Check system environment first
  if (process.env[key]) {
    return process.env[key];
  }

  // Check each variable set
  for (const vars of varSets) {
    if (vars && vars[key] !== undefined) {
      return String(vars[key]);
    }
  }

  return undefined;
}
