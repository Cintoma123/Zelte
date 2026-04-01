export interface DocPage {
  id: string
  title: string
  description: string
  content: DocSection[]
}

export interface DocSection {
  heading: string
  content: string
  codeExamples?: CodeExample[]
}

export interface CodeExample {
  filename: string
  language: string
  code: string
  output?: string
}

// Introduction page
export const introduction: DocPage = {
  id: 'introduction',
  title: 'Introduction',
  description: 'What is Zelte?',
  content: [
    {
      heading: 'What is Zelte?',
      content: `Zelte is a lightweight, zero-configuration API testing tool for backend engineers. 
It's designed to be simple, fast, and intuitive - just write your tests and run them. 
No complex setup, no boilerplate, no configuration files required.`,
    },
    {
      heading: 'Key Features',
      content: `Zelte provides everything you need for API testing:`,
      codeExamples: [
        {
          filename: '',
          language: 'text',
          code: `✓ Zero Configuration  - No flags needed, just run
✓ Auto-Detection    - Finds config, env files automatically  
✓ Simple Syntax     - Write tests like you speak
✓ REST & GraphQL    - Full support for both
✓ CLI-First         - Terminal-first, CI/CD ready
✓ Lightweight       - Minimal dependencies, fast startup
✓ Multi-Format      - YAML and JSON both supported`,
        },
      ],
    },
    {
      heading: 'Quick Example',
      content: `Here's what a basic Zelte test looks like:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `version: '1.0'
name: My API Tests

variables:
  baseUrl: http://localhost:3000

tests:
  - id: login
    name: User Login
    request:
      method: POST
      url: \${baseUrl}/auth/login
      body:
        email: test@mail.com
        password: 123456
    assertions:
      - statusCode === 200
      - body.token !== null`,
        },
      ],
    },
    {
      heading: 'Run Your Tests',
      content: `Just run the command and see results instantly:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `$ zelte run collection.yaml`,
          output: `Collection: My API Tests

Test Results:
──────────────────────────────
ID      Name        Status   
──────────────────────────────
login   User Login  ✓ PASSED 

Summary:
  1 passed, 0 failed
  Total: 1 tests in 145ms`,
        },
      ],
    },
  ],
}

// Quick Start page
export const quickStart: DocPage = {
  id: 'quick-start',
  title: 'Quick Start',
  description: 'Get started in 3 commands',
  content: [
    {
      heading: 'Command 1: Install',
      content: `Install Zelte globally on your system:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `npm install -g zelte`,
          output: `added 1 package in 2s`,
        },
      ],
    },
    {
      heading: 'Command 2: Initialize',
      content: `Create a new test collection:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `zelte init my-api-tests
cd my-api-tests`,
        },
      ],
    },
    {
      heading: 'Command 3: Run Tests',
      content: `Edit collection.yaml and run your tests:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `zelte run collection.yaml`,
          output: `Collection: My API Tests

Test Results:
──────────────────────────────
ID            Name           Status   
──────────────────────────────
example-test  Example Test   ✓ PASSED 

Summary:
  1 passed, 0 failed
  Total: 1 tests in 145ms`,
        },
      ],
    },
  ],
}

// Installation page
export const installation: DocPage = {
  id: 'installation',
  title: 'Installation',
  description: 'Install Zelte on your system',
  content: [
    {
      heading: 'Global Installation',
      content: `The easiest way to install Zelte is globally via npm:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `npm install -g zelte`,
        },
      ],
    },
    {
      heading: 'Local Installation',
      content: `Install as a dev dependency in your project:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `npm install --save-dev zelte`,
        },
        {
          filename: 'package.json',
          language: 'json',
          code: `{
  "scripts": {
    "test:api": "zelte run collection.yaml"
  }
}`,
        },
      ],
    },
    {
      heading: 'Using npx',
      content: `Run Zelte without installing:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `npx zelte run collection.yaml`,
        },
      ],
    },
  ],
}

// CLI Commands page
export const cliCommands: DocPage = {
  id: 'cli-commands',
  title: 'CLI Commands',
  description: 'Complete command reference',
  content: [
    {
      heading: 'Run Command',
      content: `Execute tests from a collection file:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `zelte run [collection] [options]

Options:
  -e, --env <name>        Environment to use
  -o, --output <format>   Output format (table, json, tap)
  --timeout <ms>          Request timeout in milliseconds
  --filter <pattern>      Regex pattern to filter tests
  --verbose               Verbose output with details
  --parallel              Enable parallel execution`,
        },
      ],
    },
    {
      heading: 'Examples',
      content: `Common usage patterns:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `# Run all tests
zelte run collection.yaml

# Run with specific environment
zelte run collection.yaml --env production

# Output as JSON for CI
zelte run collection.yaml --output json

# Run with verbose output
zelte run collection.yaml --verbose

# Filter tests by name
zelte run collection.yaml --filter "auth"`,
        },
      ],
    },
    {
      heading: 'Init Command',
      content: `Initialize a new Zelte project:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `zelte init [directory]

Creates:
  - collection.yaml (test template)
  - .zelte.env.example (env template)
  - README.md (quick reference)`,
        },
      ],
    },
    {
      heading: 'Validate Command',
      content: `Validate collection files without running:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `zelte validate collection.yaml
zelte validate collection.yaml --env production`,
        },
      ],
    },
  ],
}

// Collection Format page
export const collectionFormat: DocPage = {
  id: 'collection-format',
  title: 'Collection Format',
  description: 'Structure of test collection files',
  content: [
    {
      heading: 'Basic Structure',
      content: `Every collection file follows this structure:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `version: '1.0'              # Required: Format version
name: "Collection Name"     # Required: Human-readable name
description: "Description"  # Optional: Collection description

variables:                  # Optional: Global variables
  base_url: "https://api.example.com"
  timeout: 5000

tests:                      # Optional: REST API tests
  - id: "test-id"
    name: "Test Name"
    request:
      method: GET
      url: \${base_url}/api/endpoint
    assertions:
      - status == 200`,
        },
      ],
    },
    {
      heading: 'Variables',
      content: `Use variables to reuse values and manage environments:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `variables:
  base_url: \${API_BASE_URL}
  api_version: "v1"
  timeout: 5000

tests:
  - name: Get User
    request:
      url: \${base_url}/api/\${api_version}/users
    assertions:
      - status == 200`,
        },
      ],
    },
    {
      heading: 'Request Configuration',
      content: `Configure HTTP requests with method, URL, headers, and body:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `tests:
  - id: create-user
    name: Create User
    request:
      method: POST
      url: \${base_url}/users
      headers:
        Content-Type: application/json
        Authorization: Bearer \${API_TOKEN}
      body:
        name: "John Doe"
        email: "john@example.com"
    assertions:
      - status == 201
      - body.id exists`,
        },
      ],
    },
    {
      heading: 'Authentication',
      content: `Support for various authentication types:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `# Bearer Token
auth:
  type: bearer
  token: \${API_TOKEN}

# API Key
auth:
  type: api-key
  header: X-API-Key
  value: \${API_KEY}

# Basic Auth
auth:
  type: basic
  username: \${USERNAME}
  password: \${PASSWORD}`,
        },
      ],
    },
  ],
}

// Assertions page
export const assertions: DocPage = {
  id: 'assertions',
  title: 'Assertions',
  description: 'Validate API responses',
  content: [
    {
      heading: 'Overview',
      content: `Assertions validate that your API responses match expected conditions. 
Zelte supports a wide range of assertion types for comprehensive testing.`,
    },
    {
      heading: 'Status Code Assertions',
      content: `Check HTTP response status codes:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `assertions:
  - status == 200
  - status != 404
  - status >= 200 && status < 300
  - status == 201`,
        },
      ],
    },
    {
      heading: 'Body Assertions',
      content: `Validate response body content:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `assertions:
  # Equality checks
  - body.id == 123
  - body.name == "John Doe"
  - body.active == true

  # Null checks
  - body.token !== null
  - body.error === undefined

  # String operations
  - body.message contains "success"
  - body.email contains "@"

  # Array checks
  - body.users.length > 0
  - Array.isArray(body.items)`,
        },
      ],
    },
    {
      heading: 'Header Assertions',
      content: `Validate response headers:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `assertions:
  - headers.content-type == "application/json"
  - headers.authorization exists
  - headers.x-rate-limit-remaining > 0`,
        },
      ],
    },
    {
      heading: 'Response Time Assertions',
      content: `Ensure your API meets performance requirements:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `assertions:
  - responseTime < 1000    # Under 1 second
  - responseTime > 100     # At least 100ms
  - responseTime < 5000    # Under 5 seconds`,
        },
      ],
    },
  ],
}

// Environment Variables page
export const environmentVariables: DocPage = {
  id: 'environment-variables',
  title: 'Environment Variables',
  description: 'Manage configuration and secrets',
  content: [
    {
      heading: 'Overview',
      content: `Environment variables let you manage configuration and secrets 
outside your test files. Create a .zelte.env file in your project root.`,
    },
    {
      heading: 'Creating Environment Files',
      content: `Create a .zelte.env file with your variables:`,
      codeExamples: [
        {
          filename: '.zelte.env',
          language: 'bash',
          code: `API_BASE_URL=http://localhost:3000
API_TOKEN=your-secret-token
API_USERNAME=testuser
API_PASSWORD=testpass`,
        },
        {
          filename: '.zelte.env.example',
          language: 'bash',
          code: `# Copy this file to .zelte.env and fill in your values
API_BASE_URL=http://localhost:3000
API_TOKEN=your-secret-token
API_USERNAME=testuser
API_PASSWORD=testpass`,
        },
      ],
    },
    {
      heading: 'Using Variables in Tests',
      content: `Reference environment variables in your collection:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `variables:
  baseUrl: \${API_BASE_URL}
  token: \${API_TOKEN}

tests:
  - id: login
    request:
      url: \${baseUrl}/auth/login
      headers:
        Authorization: Bearer \${token}
    assertions:
      - status == 200`,
        },
      ],
    },
    {
      heading: 'Multiple Environments',
      content: `Use different environment files for different stages:`,
      codeExamples: [
        {
          filename: 'Terminal',
          language: 'bash',
          code: `# Development
zelte run collection.yaml --env development

# Staging  
zelte run collection.yaml --env staging

# Production
zelte run collection.yaml --env production`,
        },
      ],
    },
  ],
}

// GraphQL Testing page
export const graphqlTesting: DocPage = {
  id: 'graphql-testing',
  title: 'GraphQL Testing',
  description: 'Test GraphQL APIs with Zelte',
  content: [
    {
      heading: 'GraphQL Tests',
      content: `Zelte supports full GraphQL testing including queries, mutations, and variables:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `graphql:
  - id: get-user
    name: Get User Query
    endpoint: \${base_url}/graphql
    query: |
      query GetUser(\${id}: ID!) {
        user(id: \${id}) {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    variables:
      id: "123"
    auth:
      type: bearer
      token: \${API_TOKEN}
    assertions:
      - status == 200
      - data.data.user.id == "123"`,
        },
      ],
    },
    {
      heading: 'Mutations',
      content: `Test GraphQL mutations the same way:`,
      codeExamples: [
        {
          filename: 'collection.yaml',
          language: 'yaml',
          code: `graphql:
  - id: create-post
    name: Create Post Mutation
    endpoint: \${base_url}/graphql
    query: |
      mutation CreatePost(\$input: CreatePostInput!) {
        createPost(input: \$input) {
          post {
            id
            title
            content
          }
        }
      }
    variables:
      input:
        title: "My First Post"
        content: "Hello World"
    assertions:
      - status == 200
      - data.data.createPost.post.id exists`,
        },
      ],
    },
  ],
}

// Export all pages
export const docPages: Record<string, DocPage> = {
  introduction,
  'quick-start': quickStart,
  installation,
  'cli-commands': cliCommands,
  'collection-format': collectionFormat,
  assertions,
  'environment-variables': environmentVariables,
  'graphql-testing': graphqlTesting,
}