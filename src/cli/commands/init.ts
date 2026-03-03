/**
 * Init Command
 * Creates a basic collection template for getting started
 */

import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { logger } from '../../utils/logger';

const sampleCollection = `version: "1.0"
name: "Sample API Tests"
description: "Basic example collection"

variables:
  baseUrl: "http://localhost:3000"
  timeout: 30000

tests:
  - id: "get-health"
    name: "Check API Health"
    request:
      method: GET
      url: "\${baseUrl}/health"
    assertions:
      - status == 200

  - id: "create-item"
    name: "Create New Item"
    request:
      method: POST
      url: "\${baseUrl}/items"
      headers:
        Content-Type: "application/json"
      body:
        name: "Sample Item"
        description: "This is a test item"
    assertions:
      - status == 201
      - body.id exists

graphql:
  - id: "gql-query-user"
    name: "Query User via GraphQL"
    endpoint: "\${baseUrl}/graphql"
    query: |
      query GetUser(\$id: ID!) {
        user(id: \$id) {
          id
          name
          email
        }
      }
    variables:
      id: "1"
    assertions:
      - status == 200
      - body.data.user.id exists
`;

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
  .action(async (options: any) => {
    try {
      const dir = options.dir;
      const collectionPath = resolve(dir, 'collection.zelte.yaml');
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

      // Create collection file
      writeFileSync(collectionPath, sampleCollection, 'utf-8');
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
      logger.info('2. Edit collection.zelte.yaml with your API endpoints');
      logger.info('3. Run: zelte run collection.zelte.yaml');
    } catch (error) {
      logger.error('Failed to initialize project:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
