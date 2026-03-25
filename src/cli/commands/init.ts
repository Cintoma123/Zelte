/**
 * Init Command
 * Creates a basic collection template for getting started
 */

import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { logger } from '../../utils/logger';

const sampleCollection = `# Zelte API Test Collection
# Simple, effortless API testing

name: "My API Tests"
description: "Quick API test collection"

requests:
  - name: API Health Check
    request:
      method: GET
      url: /health
    expect:
      status: 200

  - name: User Login
    request:
      method: POST
      url: /auth/login
      headers:
        Content-Type: application/json
      body:
        email: test@mail.com
        password: 123456
    expect:
      status: 200

  - name: Get User Profile
    request:
      method: GET
      url: /users/me
    expect:
      status: 200
`;

const sampleCollectionJSON = `{
  "name": "My API Tests",
  "description": "Quick API test collection",
  "requests": [
    {
      "name": "API Health Check",
      "request": {
        "method": "GET",
        "url": "/health"
      },
      "expect": {
        "status": 200
      }
    },
    {
      "name": "User Login",
      "request": {
        "method": "POST",
        "url": "/auth/login",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "email": "test@mail.com",
          "password": 123456
        }
      },
      "expect": {
        "status": 200
      }
    },
    {
      "name": "Get User Profile",
      "request": {
        "method": "GET",
        "url": "/users/me"
      },
      "expect": {
        "status": 200
      }
    }
  ]
}`;

const sampleEnv = `# Local environment variables
# Never commit this file to version control

API_TOKEN=your_api_token_here
API_KEY=your_api_key_here
BASE_URL=http://localhost:3000
ENVIRONMENT=development
`;

export const initCommand = new Command('init')
  .description('Initialize a new Zelte project with sample files')
  .option('-d, --dir <path>', 'directory to initialize', '.')
  .option('-f, --force', 'overwrite existing files')
  .option('--yaml', 'use YAML format for collection (default)')
  .option('--json', 'use JSON format for collection')
  .action(async (options: any) => {
    try {
      const dir = options.dir;
      // Default to YAML if neither is specified, or if --yaml is explicitly set
      const useJson = options.json && !options.yaml;
      const collectionFileName = useJson ? 'collection.json' : 'collection.yaml';
      const collectionPath = resolve(dir, collectionFileName);
      const envPath = resolve(dir, '.zelte.env');
      const envExamplePath = resolve(dir, '.zelte.env.example');

      // Check for existing files
      if (!options.force) {
        if (existsSync(collectionPath)) {
          logger.warn(`File already exists: ${collectionPath}`);
          logger.info('Use --force to overwrite');
          process.exit(1);
        }
        if (existsSync(envPath)) {
          logger.warn(`File already exists: ${envPath}`);
          logger.info('Use --force to overwrite');
          process.exit(1);
        }
      }

      // Create collection file (YAML or JSON)
      const collectionContent = useJson ? sampleCollectionJSON : sampleCollection;
      writeFileSync(collectionPath, collectionContent, 'utf-8');
      logger.success(`✓ Created ${collectionPath}`);

      // Create .env file
      writeFileSync(envPath, sampleEnv, 'utf-8');
      logger.success(`✓ Created ${envPath}`);

      // Create .env.example file
      writeFileSync(envExamplePath, sampleEnv, 'utf-8');
      logger.success(`✓ Created ${envExamplePath}`);

      // Create .gitignore entry suggestion
      logger.info('');
      logger.info('Next steps:');
      logger.info('1. Update .gitignore to include: .zelte.env');
      logger.info(`2. Edit ${collectionFileName} with your API endpoints`);
      logger.info(`3. Run: zelte run ${collectionFileName}`);
    } catch (error) {
      logger.error('Failed to initialize project:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
