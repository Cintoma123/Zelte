# Getting Started

Welcome to Zelte! This guide will help you create your first API tests and understand the basic concepts.

## Your First Test

Let's start by creating a simple test collection to verify an API endpoint.

### Step 1: Create a Test Collection

You can create collections in either YAML or JSON format. Choose the format that best fits your project.

**YAML Format** (`collection.yaml`):

```yaml
version: '1.0'
name: My First API Tests
description: Testing a simple REST API

variables:
  base_url: https://jsonplaceholder.typicode.com
  timeout: 5000

tests:
  - id: health-check
    name: Health Check
    description: Verify the API is responding
    request:
      method: GET
      url: ${base_url}/posts/1
    assertions:
      - status == 200
      - body.id == 1
      - body.title exists

  - id: create-post
    name: Create New Post
    description: Test POST request to create a new post
    request:
      method: POST
      url: ${base_url}/posts
      headers:
        Content-Type: application/json
      body:
        title: "My Test Post"
        body: "This is a test post created by Zelte"
        userId: 1
    assertions:
      - status == 201
      - body.title == "My Test Post"
      - body.id exists
```

**JSON Format** (`collection.json`):

```json
{
  "version": "1.0",
  "name": "My First API Tests",
  "description": "Testing a simple REST API",
  "variables": {
    "base_url": "https://jsonplaceholder.typicode.com",
    "timeout": 5000
  },
  "tests": [
    {
      "id": "health-check",
      "name": "Health Check",
      "description": "Verify the API is responding",
      "request": {
        "method": "GET",
        "url": "${base_url}/posts/1"
      },
      "assertions": [
        "status == 200",
        "body.id == 1",
        "body.title exists"
      ]
    },
    {
      "id": "create-post",
      "name": "Create New Post",
      "description": "Test POST request to create a new post",
      "request": {
        "method": "POST",
        "url": "${base_url}/posts",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "title": "My Test Post",
          "body": "This is a test post created by Zelte",
          "userId": 1
        }
      },
      "assertions": [
        "status == 201",
        "body.title == \"My Test Post\"",
        "body.id exists"
      ]
    }
  ]
}
```

### Step 2: Run Your Tests

Execute the tests:

```bash
# For YAML files
zelte run collection.yaml

# For JSON files
zelte run collection.json
```

Expected output:
```
Running collection: collection.yaml
✓ PASS: Health Check (234ms)
✓ PASS: Create New Post (156ms)

Collection: collection.yaml
┌─────────┬────────────────┬─────────┬─────────┬─────────┐
│ (index) │      name      │  status │  time   │  error  │
├─────────┼────────────────┼─────────┼─────────┼─────────┤
│    0    │  'Health Check'  │ 'passed' │ '234ms' │   null  │
│    1    │ 'Create New Post' │ 'passed' │ '156ms' │   null  │
└─────────┴────────────────┴─────────┴─────────┴─────────┘

Summary: 2 passed, 0 failed, 0 skipped (390ms)
```

## Understanding the Structure

### Collection Structure

Every Zelte collection follows this basic structure:

```yaml
version: '1.0'              # Collection format version
name: "Collection Name"     # Human-readable name
description: "Description"  # Optional description

variables:                  # Optional global variables
  base_url: "https://api.example.com"
  timeout: 5000

tests:                      # Array of test cases
  - id: "unique-id"
    name: "Test Name"
    request: {...}
    assertions: [...]
```

### Test Case Structure

Each test case contains:

- **id**: Unique identifier for the test
- **name**: Human-readable test name
- **request**: HTTP request configuration
- **assertions**: Array of assertions to validate the response

### Request Configuration

```yaml
request:
  method: GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS
  url: "https://api.example.com/endpoint"
  headers:                    # Optional headers
    Content-Type: application/json
    Authorization: Bearer token
  body:                       # Optional request body
    key: "value"
```

### Assertions

Assertions validate the response:

```yaml
assertions:
  - status == 200              # HTTP status code
  - body.id == 1              # Response body field
  - body.title exists         # Field existence
  - time < 1000               # Response time in ms
  - headers.content-type contains "json"  # Header validation
```

## Common Patterns

### Environment Variables

Use environment variables for sensitive data:

```yaml
# collection.yaml
tests:
  - name: Authenticated Request
    request:
      url: ${API_BASE_URL}/protected
      headers:
        Authorization: Bearer ${API_TOKEN}
    assertions:
      - status == 200
```

Create `.zelte.env`:
```bash
# .zelte.env
API_BASE_URL=https://api.example.com
API_TOKEN=your-secret-token-here
```

### Variable Substitution

Use variables throughout your collection:

```yaml
variables:
  base_url: https://api.example.com
  user_id: 123

tests:
  - name: Get User
    request:
      url: ${base_url}/users/${user_id}
    assertions:
      - body.id == ${user_id}
```

### Test Dependencies

Extract data from one test for use in another:

```yaml
tests:
  - id: create-user
    name: Create User
    request:
      method: POST
      url: ${base_url}/users
      body:
        name: "John Doe"
        email: "john@example.com"
    assertions:
      - status == 201
    expect:
      variables:
        user_id: data.id        # Extract user ID

  - id: get-user
    name: Get Created User
    request:
      url: ${base_url}/users/${user_id}  # Use extracted ID
    assertions:
      - status == 200
      - body.name == "John Doe"
```

## Running Tests

### Basic Commands

```bash
# Run all tests
zelte run collection.yaml
zelte run collection.json

# Run with specific environment
zelte run collection.yaml --env production
zelte run collection.json --env production

# Run with verbose output
zelte run collection.yaml --verbose
zelte run collection.json --verbose

# Filter tests by name
zelte run collection.yaml --filter "health"
zelte run collection.json --filter "health"
```

### Output Formats

```bash
# Table format (default)
zelte run collection.yaml --output table
zelte run collection.json --output table

# JSON format (for CI/CD)
zelte run collection.yaml --output json
zelte run collection.json --output json

# TAP format
zelte run collection.yaml --output tap
zelte run collection.json --output tap

# Raw output
zelte run collection.yaml --output raw
zelte run collection.json --output raw
```

### Performance Options

```bash
# Set request timeout
zelte run collection.yaml --timeout 10000
zelte run collection.json --timeout 10000

# Run tests in parallel
zelte run collection.yaml --parallel
zelte run collection.json --parallel

# Run tests sequentially
zelte run collection.yaml --serial
zelte run collection.json --serial
```

## Next Steps

Now that you understand the basics, explore:

- [Collection Format](./collection-format.md) - Detailed collection structure
- [Environment Variables](./environment-variables.md) - Secure credential management
- [Authentication](./authentication.md) - API authentication methods
- [Assertions](./assertions.md) - Advanced assertion techniques
- [GraphQL Testing](./graphql-testing.md) - Testing GraphQL APIs