# Assertions

Assertions are the core of API testing in Zelte. They validate that your API responses meet expected conditions and help ensure your APIs work correctly.

## Overview

Assertions in Zelte are simple string expressions that evaluate to true or false. They validate various aspects of HTTP responses including status codes, response times, headers, and response body content.

## Assertion Syntax

Assertions use a simple expression syntax:

```yaml
assertions:
  - "expression"
  - "another expression"
```

### Basic Assertion Structure

```yaml
assertions:
  - status == 200
  - body.id == 123
  - time < 1000
```

## Built-in Accessors

Zelte provides several built-in accessors to reference different parts of the HTTP response:

### Status Code (`status`)

Access the HTTP status code:

```yaml
assertions:
  - status == 200
  - status != 404
  - status > 200
  - status < 500
```

### Response Time (`time`)

Access the response time in milliseconds:

```yaml
assertions:
  - time < 1000      # Response under 1 second
  - time > 100       # Response over 100ms
  - time >= 50       # Response at least 50ms
```

### Response Body (`body`)

Access the parsed response body (JSON or string):

```yaml
# JSON response
assertions:
  - body.id == 123
  - body.name == "John Doe"
  - body.success == true
  - body.users.length > 0

# Nested properties
assertions:
  - body.user.profile.email == "john@example.com"
  - body.data.results[0].id == 1
```

### Response Headers (`headers`)

Access response headers:

```yaml
assertions:
  - headers.content-type == "application/json"
  - headers.authorization exists
  - headers.x-rate-limit contains "1000"
  - headers.etag != null
```

### Environment Variables (`env`)

Access environment variables:

```yaml
assertions:
  - body.api_version == env.API_VERSION
  - body.environment == env.NODE_ENV
```

## Comparison Operators

### Equality Operators

- `==` - Equal to
- `!=` - Not equal to

```yaml
assertions:
  - status == 200
  - body.type != "error"
  - headers.content-type == "application/json"
```

### Comparison Operators

- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal to
- `<=` - Less than or equal to

```yaml
assertions:
  - time < 1000
  - body.users.length >= 1
  - status >= 200
  - status <= 500
```

## String Operations

### Contains

Check if a string contains a substring:

```yaml
assertions:
  - body.message contains "success"
  - body.error !contains "timeout"
  - headers.content-type contains "json"
```

### Matches (Regular Expressions)

Use regular expressions for pattern matching:

```yaml
assertions:
  - body.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  - body.timestamp matches "^2023-"
  - body.id !matches "^[0-9]+$"
```

## Existence Checks

### Exists

Check if a field exists in the response:

```yaml
assertions:
  - body.id exists
  - body.user.name exists
  - headers.x-custom-header exists
  - body.optional_field !exists
```

## Assertion Examples

### Status Code Assertions

```yaml
tests:
  - name: Successful Request
    request:
      method: GET
      url: ${base_url}/users
    assertions:
      - status == 200

  - name: Not Found
    request:
      method: GET
      url: ${base_url}/users/999
    assertions:
      - status == 404

  - name: Created Resource
    request:
      method: POST
      url: ${base_url}/users
      body:
        name: "John Doe"
    assertions:
      - status == 201
```

### Response Time Assertions

```yaml
tests:
  - name: Fast Response
    request:
      method: GET
      url: ${base_url}/health
    assertions:
      - status == 200
      - time < 500

  - name: Performance Check
    request:
      method: GET
      url: ${base_url}/large-dataset
    assertions:
      - status == 200
      - time < 5000
```

### Body Assertions

```yaml
tests:
  - name: User Data
    request:
      method: GET
      url: ${base_url}/users/1
    assertions:
      - status == 200
      - body.id == 1
      - body.name == "John Doe"
      - body.email exists
      - body.active == true

  - name: Array Response
    request:
      method: GET
      url: ${base_url}/users
    assertions:
      - status == 200
      - body.users exists
      - body.users.length > 0
      - body.users[0].id == 1
```

### Header Assertions

```yaml
tests:
  - name: Content Type
    request:
      method: GET
      url: ${base_url}/users
    assertions:
      - status == 200
      - headers.content-type == "application/json"
      - headers.cache-control exists

  - name: Authentication Header
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 200
      - headers.x-authenticated == "true"
```

### Complex Assertions

```yaml
tests:
  - name: Complete User Validation
    request:
      method: GET
      url: ${base_url}/users/1
    assertions:
      - status == 200
      - body.id == 1
      - body.name exists
      - body.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      - body.created_at exists
      - body.updated_at >= body.created_at
      - body.roles.length >= 1
      - body.active == true
```

## Assertion Best Practices

### 1. Be Specific

Write specific assertions that validate the exact behavior you expect:

```yaml
# ❌ Vague
assertions:
  - status == 200

# ✅ Specific
assertions:
  - status == 200
  - body.user.id == 123
  - body.user.name == "John Doe"
  - body.user.email exists
```

### 2. Test Error Conditions

Include assertions for error scenarios:

```yaml
tests:
  - name: Invalid Request
    request:
      method: POST
      url: ${base_url}/users
      body:
        name: ""
    assertions:
      - status == 400
      - body.error exists
      - body.error.message contains "name is required"
```

### 3. Validate Response Structure

Ensure your API returns the expected data structure:

```yaml
assertions:
  - body exists
  - body.data exists
  - body.data.users exists
  - body.data.users.length >= 0
  - body.meta exists
  - body.meta.total >= 0
```

### 4. Use Performance Assertions

Include response time assertions for critical endpoints:

```yaml
assertions:
  - status == 200
  - time < 1000  # Under 1 second
```

### 5. Test Edge Cases

Validate boundary conditions and edge cases:

```yaml
# Empty array
assertions:
  - body.users exists
  - body.users.length >= 0

# Null values
assertions:
  - body.optional_field != null

# Large values
assertions:
  - body.id > 0
  - body.created_at matches "^\\d{4}-\\d{2}-\\d{2}"
```

## Common Assertion Patterns

### API Health Check

```yaml
tests:
  - name: API Health
    request:
      method: GET
      url: ${base_url}/health
    assertions:
      - status == 200
      - body.status == "ok"
      - body.timestamp exists
      - time < 500
```

### CRUD Operations

```yaml
# Create
- name: Create User
  request:
    method: POST
    url: ${base_url}/users
    body:
      name: "John Doe"
      email: "john@example.com"
  assertions:
    - status == 201
    - body.id exists
    - body.name == "John Doe"
    - body.email == "john@example.com"

# Read
- name: Get User
  request:
    method: GET
    url: ${base_url}/users/${user_id}
  assertions:
    - status == 200
    - body.id == ${user_id}
    - body.name exists

# Update
- name: Update User
  request:
    method: PUT
    url: ${base_url}/users/${user_id}
    body:
      name: "Jane Doe"
      email: "jane@example.com"
  assertions:
    - status == 200
    - body.name == "Jane Doe"
    - body.email == "jane@example.com"

# Delete
- name: Delete User
  request:
    method: DELETE
    url: ${base_url}/users/${user_id}
  assertions:
    - status == 204
```

### Authentication Tests

```yaml
tests:
  - name: Unauthenticated Request
    request:
      method: GET
      url: ${base_url}/protected
    assertions:
      - status == 401
      - body.error == "Unauthorized"

  - name: Valid Token
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: ${VALID_TOKEN}
    assertions:
      - status == 200
      - body.user exists

  - name: Invalid Token
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: "invalid-token"
    assertions:
      - status == 401
      - body.error contains "invalid token"
```

### Data Validation

```yaml
tests:
  - name: Required Fields
    request:
      method: POST
      url: ${base_url}/users
      body:
        email: "test@example.com"
    assertions:
      - status == 400
      - body.errors exists
      - body.errors.name contains "required"

  - name: Valid Email Format
    request:
      method: POST
      url: ${base_url}/users
      body:
        name: "John Doe"
        email: "invalid-email"
    assertions:
      - status == 400
      - body.errors.email contains "invalid format"

  - name: Unique Email
    request:
      method: POST
      url: ${base_url}/users
      body:
        name: "Jane Doe"
        email: "existing@example.com"
    assertions:
      - status == 409
      - body.error contains "email already exists"
```

## Troubleshooting Assertions

### Common Issues

1. **Field Not Found**: Ensure the field exists in the response
2. **Type Mismatch**: Check that you're comparing compatible types
3. **Timing Issues**: For async operations, ensure data is available
4. **Case Sensitivity**: String comparisons are case-sensitive

### Debug Tips

1. **Use Verbose Mode**: Run with `--verbose` to see actual response data
2. **Check Response Format**: Verify the response is JSON vs plain text
3. **Test Step by Step**: Add simple assertions first, then build complexity
4. **Use Environment Variables**: Reference extracted values correctly

### Example Debug Session

```yaml
# Start simple
assertions:
  - status == 200

# Add body check
assertions:
  - status == 200
  - body exists

# Check specific field
assertions:
  - status == 200
  - body exists
  - body.user exists

# Check nested field
assertions:
  - status == 200
  - body exists
  - body.user exists
  - body.user.name == "John Doe"
```

By following these patterns and best practices, you can create robust, reliable assertions that thoroughly validate your API behavior and catch issues early in your development process.