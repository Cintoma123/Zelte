/**
 * Auto-Detection System
 * 
 * Intelligently discovers configuration without requiring user input:
 * - Config files (.zelte.json, zelte.config.json, etc.)
 * - Environment files (.zelte.env, .env, etc.)
 * - Base URL / API host from multiple sources
 * 
 * PRINCIPLE: Zero configuration for common setups
 * - If you follow standard naming conventions, everything just works
 * - No CLI flags needed (--config, --env, --host)
 * - Sensible defaults for everything
 */

import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { logger } from '../utils/logger';
import { loadFile, loadEnvFile } from './loader';

export interface AutoDetectResult {
  configPath: string | null;
  envPath: string | null;
  baseUrl: string | null;
  variables: Record<string, string>;
  debug: {
    configSearched: string[];
    envSearched: string[];
  };
}

/**
 * STANDARD CONFIG FILE LOCATIONS (in priority order)
 * 1. .zelte.json - Explicit Zelte config
 * 2. zelte.config.json - Alternative naming
 * 3. .zelte.yaml - YAML format
 * 4. package.json → "zelte" field - Embedded in package.json
 */
const CONFIG_PATTERNS = [
  '.zelte.json',
  'zelte.config.json',
  '.zelte.yaml',
  '.zelte.yml',
  'zelte.config.yaml',
  'zelte.config.yml',
  'package.json', // Check for "zelte" field
];

/**
 * STANDARD ENV FILE LOCATIONS (in priority order)
 * 1. .zelte.env - Explicit Zelte environment
 * 2. .env.local - Local overrides
 * 3. .env - Standard dotenv format
 */
const ENV_PATTERNS = [
  '.zelte.env',
  '.zelte.env.local',
  '.env.local',
  '.env',
];

/**
 * STANDARD BASE URL SOURCES (in priority order)
 * 1. CLI arg (handled externally)
 * 2. Environment variable: API_URL, BASE_URL, ZELTE_URL
 * 3. Config file "baseUrl" field
 * 4. package.json → "zelte.baseUrl"
 * 5. Default: http://localhost:3000 (for local dev)
 */

/**
 * Find config file in current directory or parents
 */
function findConfigFile(cwd: string = process.cwd()): string | null {
  logger.debug(`[auto-detect] Searching for config file in: ${cwd}`);
  const searchedPaths: string[] = [];

  for (const pattern of CONFIG_PATTERNS) {
    const filePath = resolve(cwd, pattern);
    searchedPaths.push(filePath);

    if (existsSync(filePath)) {
      logger.debug(`[auto-detect] Found config: ${filePath}`);
      return filePath;
    }
  }

  logger.debug(`[auto-detect] No config file found. Searched: ${searchedPaths.join(', ')}`);
  return null;
}

/**
 * Find env file in current directory or parents
 */
function findEnvFile(cwd: string = process.cwd()): string | null {
  logger.debug(`[auto-detect] Searching for env file in: ${cwd}`);
  const searchedPaths: string[] = [];

  for (const pattern of ENV_PATTERNS) {
    const filePath = resolve(cwd, pattern);
    searchedPaths.push(filePath);

    if (existsSync(filePath)) {
      logger.debug(`[auto-detect] Found env file: ${filePath}`);
      return filePath;
    }
  }

  logger.debug(`[auto-detect] No env file found. Searched: ${searchedPaths.join(', ')}`);
  return null;
}

/**
 * Extract base URL from multiple sources
 */
function detectBaseUrl(
  configData: any,
  envVars: Record<string, string>
): string | null {
  // 1. Check environment variables first (highest priority)
  const envBase = envVars.API_URL || envVars.BASE_URL || envVars.ZELTE_URL;
  if (envBase) {
    logger.debug(`[auto-detect] Base URL from env: ${envBase}`);
    return envBase;
  }

  // 2. Check config file
  if (configData?.baseUrl) {
    logger.debug(`[auto-detect] Base URL from config: ${configData.baseUrl}`);
    return configData.baseUrl;
  }

  if (configData?.zelte?.baseUrl) {
    logger.debug(`[auto-detect] Base URL from config.zelte: ${configData.zelte.baseUrl}`);
    return configData.zelte.baseUrl;
  }

  // 3. Default for local development
  logger.debug('[auto-detect] Using default base URL: http://localhost:3000');
  return 'http://localhost:3000';
}

/**
 * Extract variables from config file
 */
function extractConfigVariables(configData: any): Record<string, string> {
  const vars: Record<string, string> = {};

  if (configData?.variables) {
    Object.assign(vars, configData.variables);
  }

  if (configData?.zelte?.variables) {
    Object.assign(vars, configData.zelte.variables);
  }

  return vars;
}

/**
 * MAIN AUTO-DETECT FUNCTION
 * Orchestrates discovery of all configuration sources
 */
export async function autoDetectConfig(
  cwd: string = process.cwd(),
  options?: {
    configPath?: string;
    envPath?: string;
    baseUrl?: string;
    skipEnv?: boolean;
  }
): Promise<AutoDetectResult> {
  logger.info('[auto-detect] Starting configuration auto-detection...');

  const result: AutoDetectResult = {
    configPath: null,
    envPath: null,
    baseUrl: null,
    variables: {},
    debug: {
      configSearched: [],
      envSearched: [],
    },
  };

  // 1. Override with explicit options if provided
  if (options?.configPath) {
    result.configPath = options.configPath;
    logger.debug(`[auto-detect] Using explicit config: ${options.configPath}`);
  } else {
    // Auto-detect config file
    result.configPath = findConfigFile(cwd);
  }

  // 2. Load config file if found
  let configData: any = null;
  if (result.configPath) {
    try {
      configData = loadFile(result.configPath);
      logger.debug(`[auto-detect] Loaded config from: ${result.configPath}`);
      Object.assign(result.variables, extractConfigVariables(configData));
    } catch (error) {
      logger.warn(
        `[auto-detect] Failed to load config '${result.configPath}': ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 3. Load environment file
  if (!options?.skipEnv) {
    if (options?.envPath) {
      result.envPath = options.envPath;
      result.variables = { ...result.variables, ...loadEnvFile(options.envPath) };
      logger.debug(`[auto-detect] Using explicit env: ${options.envPath}`);
    } else {
      // Auto-detect env file
      result.envPath = findEnvFile(cwd);
      if (result.envPath) {
        const envVars = loadEnvFile(result.envPath);
        result.variables = { ...result.variables, ...envVars };
      }
    }
  }

  // 4. Detect base URL
  if (options?.baseUrl) {
    result.baseUrl = options.baseUrl;
    logger.debug(`[auto-detect] Using explicit baseUrl: ${options.baseUrl}`);
  } else {
    result.baseUrl = detectBaseUrl(configData, result.variables);
  }

  // 5. Add process.env variables (lowest priority)
  const finalVariables: Record<string, string> = {};
  Object.assign(finalVariables, process.env as any);
  Object.assign(finalVariables, result.variables);
  result.variables = finalVariables;

  logger.info('[auto-detect] Configuration auto-detection complete');
  logger.debug('[auto-detect] Result:', {
    configPath: result.configPath,
    envPath: result.envPath,
    baseUrl: result.baseUrl,
    variableCount: Object.keys(result.variables).length,
  });

  return result;
}

/**
 * Find all test files in a directory
 * Supports: *.yaml, *.yml, *.json (that are NOT the collection file)
 */
export function findTestFiles(
  directory: string = process.cwd(),
  pattern: string = '**/*.{yaml,yml,json}'
): string[] {
  const files: string[] = [];

  try {
    const files = readdirSync(directory, { recursive: true, withFileTypes: true })
      .filter((f) => !f.isDirectory())
      .map((f) => resolve(f.parentPath || directory, f.name))
      .filter((path) => {
        const lower = path.toLowerCase();
        return (lower.endsWith('.yaml') || lower.endsWith('.yml') || lower.endsWith('.json')) &&
               !lower.includes('node_modules') &&
               !lower.includes('.git');
      });

    logger.debug(`[auto-detect] Found ${files.length} test files`);
    return files;
  } catch (error) {
    logger.debug(`[auto-detect] Error scanning directory: ${error}`);
    return [];
  }
}

/**
 * Smart collection path detection
 * If user doesn't specify a path, find it automatically
 */
export function autoDetectCollectionPath(
  providedPath?: string,
  cwd: string = process.cwd()
): string {
  if (providedPath) {
    logger.debug(`[auto-detect] Using provided collection path: ${providedPath}`);
    return providedPath;
  }

  // Look for collection.yaml, collection.json, or tests.yaml
  const candidates = [
    resolve(cwd, 'collection.yaml'),
    resolve(cwd, 'collection.yml'),
    resolve(cwd, 'collection.json'),
    resolve(cwd, 'tests.yaml'),
    resolve(cwd, 'tests.yml'),
    resolve(cwd, 'tests.json'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      logger.debug(`[auto-detect] Found collection: ${candidate}`);
      return candidate;
    }
  }

  // Default to collection.yaml (will exist or error appropriately)
  logger.debug('[auto-detect] No collection found, using default: collection.yaml');
  return resolve(cwd, 'collection.yaml');
}
