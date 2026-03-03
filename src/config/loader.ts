/**
 * Configuration Loader
 * Loads and parses YAML/JSON collection and environment files
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { Collection, ConfigLoaderOptions, Variables } from '../types/index';
import { logger } from '../utils/logger';

export class ConfigLoader {
  private envFile: string;
  private envVars: Record<string, string> = {};

  constructor(options: ConfigLoaderOptions = {}) {
    this.envFile = options.envFile || '.zelte.env';
    this.loadEnvironmentVariables(options.envName);
  }

  /**
   * Load environment variables from .zelte.env or .zelte.env.[stage]
   */
  private loadEnvironmentVariables(envName?: string): void {
    try {
      let envPath = this.envFile;
      
      // If specific environment requested, try that file first
      if (envName) {
        const envStageFile = `.zelte.env.${envName}`;
        try {
          const stageContent = readFileSync(resolve(envStageFile), 'utf-8');
          this.parseEnvFile(stageContent);
          logger.debug(`Loaded environment: ${envStageFile}`);
          return;
        } catch (error) {
          logger.debug(`Environment file not found: ${envStageFile}`);
        }
      }

      // Fall back to default .zelte.env
      try {
        const content = readFileSync(resolve(envPath), 'utf-8');
        this.parseEnvFile(content);
        logger.debug(`Loaded environment: ${envPath}`);
      } catch (error) {
        logger.debug(`Environment file not found: ${envPath}`);
        // This is not an error - .zelte.env is optional
      }
    } catch (error) {
      logger.debug(`Failed to load environment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse .env file format (KEY=VALUE lines)
   */
  private parseEnvFile(content: string): void {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split('=');
      const cleanKey = key.trim();
      const cleanValue = valueParts.join('=').trim();

      // Remove quotes if present
      const unquoted = cleanValue.replace(/^["']|["']$/g, '');
      
      this.envVars[cleanKey] = unquoted;
    }
  }

  /**
   * Load collection file (YAML or JSON)
   */
  loadCollection(filePath: string): Collection {
    try {
      const content = readFileSync(resolve(filePath), 'utf-8');
      const ext = filePath.toLowerCase().endsWith('.json') ? 'json' : 'yaml';

      let collection: any;
      if (ext === 'json') {
        collection = JSON.parse(content);
      } else {
        collection = YAML.parse(content);
      }

      logger.debug(`Loaded collection from: ${filePath}`);
      return collection as Collection;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load collection file '${filePath}': ${message}`);
    }
  }

  /**
   * Get environment variables
   */
  getEnvironmentVariables(): Variables {
    return { ...this.envVars };
  }

  /**
   * Get a specific environment variable
   */
  getEnv(key: string): string | undefined {
    return process.env[key] || this.envVars[key];
  }

  /**
   * Merge variables: env vars + collection vars + context vars
   */
  mergeVariables(...varSets: (Variables | undefined)[]): Variables {
    const merged: Variables = {
      // Start with environment variables (lowest priority)
      ...this.envVars,
    };

    // Merge each variable set in order
    for (const vars of varSets) {
      if (vars) {
        Object.assign(merged, vars);
      }
    }

    return merged;
  }
}

export function createConfigLoader(options?: ConfigLoaderOptions): ConfigLoader {
  return new ConfigLoader(options);
}
