# Collection Format

Zelte collections define your API tests in either YAML or JSON format. This document explains the complete structure and all available options.

## File Format Support

Zelte supports both YAML and JSON collection files:

- **YAML files**: `.yaml` or `.yml` extension
- **JSON files**: `.json` extension

Both formats support identical features and capabilities.

## Basic Structure

Every collection file follows this structure:

```yaml
version: '1.0'              # Required: Collection format version
name: "Collection Name"     # Required: Human-readable name
description: "Description"  # Optional: Collection description

variables:                  # Optional: Global variables
  base_url: "https://api.example.com"
  timeout: 5000

tests:                      # Optional: REST API tests
  - id: "test-id"
    name: "Test Name"
    # ... test configuration

graphql:                    # Optional: GraphQL tests
  - id: "graphql-test-id"
    name: "GraphQL Test Name"
    # ... GraphQL test configuration
```

## Variables

Variables allow you to reuse values across your collection and manage environment-specific configurations.

### Global Variables

Define variables at the collection level:

```yaml
variables:
  base_url: "https://api.example.com"
  api_version: "v1"
  timeout: 5000
  user_id: 123
```

### Variable Substitution

Use variables with the `${variable_name}` syntax:

```yaml
tests:
  - name: Get User
    request:
      url: ${base_url}/api/${api_version}/users/${user_id}
    assertions:
      - body.id == ${user_id}
```

### Variable Scope

Variables are resolved in this order:
1. **Test variables** (defined in test's `variables` section)
2. **Collection variables** (defined in collection's `variables` section)
3. **Environment variables** (from `.zelte.env` files)
4. **System environment variables**

## REST API Tests

REST tests define HTTP requests and their expected responses.

### Test Structure

```yaml
tests:
  - id: "unique-test-id"           # Required: Unique identifier
    name: "Test Name"              # Required: Human-readable name
    description: "Test description" # Optional: Detailed description
    skip: false                    # Optional: Skip this test (default: false)
    
    request:                       # Required: HTTP request configuration
      method: GET                  # Required: HTTP method
      url: "https://api.example.com" # Required: Request URL
      headers:                     # Optional: Request headers
        Content-Type: application/json
        Authorization: Bearer token
      body:                        # Optional: Request body
        key: "value"
    
    auth:                          # Optional: Authentication configuration
      type: bearer                 # Authentication type
      token: ${API_TOKEN}          # Authentication value
    
    timeout: 5000                  # Optional: Request timeout in milliseconds
    
    assertions:                    # Required: Array of assertions
      - status == 200
      - body.success == true
    
    expect:                        # Optional: Variable extraction
      variables:
        user_id: data.id           # Extract user_id from response
```

### Request Configuration

#### HTTP Methods

Supported methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`

```yaml
request:
  method: POST
  url: https://api.example.com/users
```

#### Headers

Define request headers as key-value pairs:

```yaml
request:
  headers:
    Content-Type: application/json
    Accept: application/json
    Authorization: Bearer ${API_TOKEN}
    X-Custom-Header: custom-value
```

#### Request Body

Supports multiple body types:

```yaml
# JSON body
request:
  body:
    name: "John Doe"
    email: "john@example.com"

# String body
request:
  body: '{"name": "John", "email": "john@example.com"}'

# Form data
request:
  headers:
    Content-Type: application/x-www-form-urlencoded
  body: "name=John+Doe&email=john%40example.com"
```

### Authentication

#### Bearer Token

```yaml
auth:
  type: bearer
  token: ${API_BEARER_TOKEN}
```

#### API Key

```yaml
auth:
  type: api-key
  header: X-API-Key
  value: ${API_KEY}
```

#### Basic Authentication

```yaml
auth:
  type: basic
  username: ${API_USERNAME}
  password: ${API_PASSWORD}
```

#### Environment Inheritance

```yaml
auth:
  type: inherit-from-env
  header: Authorization
  value: ${AUTH_HEADER}
```

## GraphQL Tests

GraphQL tests allow you to test GraphQL endpoints with queries and mutations.

### GraphQL Test Structure

```yaml
graphql:
  - id: "graphql-test-id"
    name: "GraphQL Test Name"
    description: "Test description"
    skip: false
    
    endpoint: "https://api.example.com/graphql" # Required: GraphQL endpoint
    method: POST                               # Optional: HTTP method (default: POST)
    
    query: |                                   # Required: GraphQL query
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    
    variables:                                 # Optional: GraphQL variables
      id: "123"
      name: "John"
    
    auth:                                      # Optional: Authentication
      type: bearer
      token: ${API_TOKEN}
    
    timeout: 5000                              # Optional: Request timeout
    
    assertions:                                # Required: Assertions
      - status == 200
      - data.data.user.id == "123"
    
    expect:                                    # Optional: Variable extraction
      variables:
        user_email: data.data.user.email
```

### GraphQL Query Syntax

Use standard GraphQL query syntax:

```yaml
query: |
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
        createdAt
      }
    }
  }
```

### GraphQL Variables

Pass variables to your GraphQL queries:

```yaml
variables:
  id: "123"
  filter: "published"
  limit: 10
```

## Assertions

Assertions validate the response against expected conditions.

### Built-in Assertions

#### Status Code Assertions

```yaml
assertions:
  - status == 200
  - status != 404
  - status > 200
  - status < 500
```

#### Response Time Assertions

```yaml
assertions:
  - time < 1000      # Response time in milliseconds
  - time > 100
```

#### Body Assertions

```yaml
assertions:
  - body.id == 123
  - body.name == "John Doe"
  - body.success == true
  - body.users.length > 0
  - body.message contains "success"
  - body.error matches "^Error:.*"
```

#### Header Assertions

```yaml
assertions:
  - headers.content-type == "application/json"
  - headers.authorization exists
  - headers.x-rate-limit contains "1000"
```

#### Existence Assertions

```yaml
assertions:
  - body.id exists
  - body.user.name exists
  - headers.x-custom-header !exists
```

### String Operations

#### Contains

```yaml
assertions:
  - body.message contains "success"
  - body.error !contains "timeout"
```

#### Matches (Regular Expressions)

```yaml
assertions:
  - body.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  - body.timestamp !matches "^2023-"
```

### Comparison Operators

- `==` - Equal to
- `!=` - Not equal to
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal to
- `<=` - Less than or equal to

## Variable Extraction

Extract values from responses for use in subsequent tests:

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
        user_id: data.id
        user_email: data.email

  - id: get-user
    name: Get User
    request:
      url: ${base_url}/users/${user_id}
    assertions:
      - status == 200
      - body.email == ${user_email}
```

## Test Filtering

Use the `--filter` option to run specific tests:

```bash
# Run tests matching "auth"
zelte run collection.yaml --filter "auth"

# Run tests matching "user"
zelte run collection.yaml --filter "user"

# Run tests by ID
zelte run collection.yaml --filter "^create-user$"
```

## Best Practices

### File Organization

1. **Use descriptive names**: Choose clear, descriptive names for tests and collections
2. **Group related tests**: Organize tests by functionality or API endpoint
3. **Use variables**: Avoid hardcoded values, use variables for URLs, tokens, etc.
4. **Skip tests**: Use `skip: true` for tests that shouldn't run in certain environments

### Variable Management

1. **Environment separation**: Use different `.zelte.env` files for different environments
2. **Secure credentials**: Never commit `.zelte.env` files to version control
3. **Use examples**: Provide `.zelte.env.example` files with placeholder values

### Test Structure

1. **Clear assertions**: Write specific, meaningful assertions
2. **Error handling**: Include assertions for error conditions
3. **Response validation**: Validate both success and error responses
4. **Performance testing**: Include response time assertions for critical endpoints

### Example Collection

```yaml
version: '1.0'
name: User Management API Tests
description: Complete test suite for user management endpoints

variables:
  base_url: ${API_BASE_URL}
  timeout: 5000

tests:
  - id: health-check
    name: API Health Check
    request:
      method: GET
      url: ${base_url}/health
    assertions:
      - status == 200
      - body.status == "ok"

  - id: create-user
    name: Create New User
    request:
      method: POST
      url: ${base_url}/users
      headers:
        Content-Type: application/json
      body:
        name: "Test User"
        email: "test@example.com"
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 201
      - body.id exists
      - body.name == "Test User"
    expect:
      variables:
        user_id: data.id

  - id: get-user
    name: Get User by ID
    request:
      method: GET
      url: ${base_url}/users/${user_id}
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 200
      - body.id == ${user_id}
      - body.name == "Test User"

  - id: update-user
    name: Update User
    request:
      method: PUT
      url: ${base_url}/users/${user_id}
      headers:
        Content-Type: application/json
      body:
        name: "Updated User"
        email: "updated@example.com"
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 200
      - body.name == "Updated User"

  - id: delete-user
    name: Delete User
    request:
      method: DELETE
      url: ${base_url}/users/${user_id}
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 204
```

This comprehensive format allows you to create powerful, maintainable API test suites that can handle complex scenarios while remaining readable and organized.