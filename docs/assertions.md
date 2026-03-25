# Assertions

Assertions are the core of API testing in Zelte. They validate that your API responses meet expected conditions using simple JavaScript expressions.

## Overview

Assertions in Zelte are JavaScript expressions that evaluate to `true` or `false`. They validate various aspects of HTTP responses including status codes, response times, headers, and response body content.

## Assertion Syntax

Assertions are JavaScript expressions evaluated against the HTTP response:

```yaml
assertions:
  - statusCode === 200
  - body.id !== null
  - time < 1000
```

## Available Context Variables

### statusCode
The HTTP status code of the response:

```yaml
assertions:
  - statusCode === 200              # Exact match
  - statusCode !== 404              # Not equal
  - statusCode >= 200               # Greater than or equal
  - statusCode < 400                # Status is 2xx or 3xx
```

### body
The parsed response body (JSON object or string):

```yaml
assertions:
  - body.id !== null                # Field exists
  - body.email === "john@example.com"  # Exact match
  - body.success === true           # Boolean check
  - body.user.name !== null         # Nested property
  - body.items.length > 0           # Array length
  - body.message.includes("error")  # String method
```

### time
The response time in milliseconds:

```yaml
assertions:
  - time < 1000                     # Under 1 second
  - time > 100                      # Over 100ms
  - time >= 50                      # At least 50ms
```

### headers
Response headers (normalized to lowercase keys):

```yaml
assertions:
  - headers['content-type'] === "application/json"
  - headers['authorization'] !== null
  - headers['x-rate-limit'].includes("1000")
```

### data
Alias for `body` (for parsed JSON responses):

```yaml
assertions:
  - data.userId !== null            # Same as body.userId
  - data.email.includes("@")        # String method
```

## JavaScript Expressions

Since assertions are JavaScript expressions, you can use:

### Comparison Operators
```yaml
assertions:
  - statusCode === 200              # Strict equality
  - statusCode !== 404              # Strict inequality
  - body.count > 10
  - body.count < 100
  - body.count >= 5
  - body.count <= 50
```

### String Methods
```yaml
assertions:
  - body.message.includes("success")
  - body.email.includes("@")
  - body.url.startsWith("https://")
  - body.name.length > 0
  - body.message.toLowerCase() === "error"
```

### Array Methods
```yaml
assertions:
  - body.items.length > 0
  - body.items[0].id !== null
  - body.tags.includes("important")
  - body.users.some(u => u.active)
```

### Logical Operations
```yaml
assertions:
  - statusCode === 200 && body.id !== null
  - statusCode === 404 || statusCode === 400
  - body.active === true && body.verified === true
```

### Type Checks
```yaml
assertions:
  - typeof body.id === "number"
  - Array.isArray(body.items)
  - body.email !== null && body.email !== undefined
```

## Helper Functions

### get(object, path)
Access deeply nested properties:

```yaml
assertions:
  - get(body, 'user.profile.email') === "john@example.com"
  - get(data, 'items.0.id') !== null
```

### accessArray(array, index)
Safe array access:

```yaml
assertions:
  - accessArray(body.items, 0).id === 1
  - accessArray(body.results, 100) === undefined
```

## Common Assertion Patterns

### Status Code Validation
```yaml
assertions:
  - statusCode === 200              # Success
  - statusCode === 201              # Created
  - statusCode === 400              # Bad request
  - statusCode === 401              # Unauthorized
  - statusCode === 404              # Not found
  - statusCode >= 200 && statusCode < 300   # Any 2xx
```

### Response Body Validation
```yaml
assertions:
  - body.id !== null                # Field exists
  - body.message !== ""             # Non-empty string
  - body.items.length > 0           # Non-empty array
  - body.active === true            # Boolean field
  - body.email.includes("@")        # Email format check
```

### Response Time Validation
```yaml
assertions:
  - time < 500                      # Under 500ms
  - time < 1000                     # Under 1 second
  - time > 50                       # At least 50ms
```

### JSON Array Validation
```yaml
assertions:
  - Array.isArray(body.items)       # Is array
  - body.items.length > 0           # Not empty
  - body.items[0].id !== null       # First item exists
  - body.items.some(item => item.active)   # At least one matches
```

## Complete Example

```yaml
version: "1.0"
name: User API Tests

tests:
  - id: create-user
    name: Create User
    request:
      method: POST
      url: http://localhost:3000/users
      body:
        email: john@example.com
        password: secret123
    assertions:
      - statusCode === 201           # Created
      - body.id !== null             # Has ID
      - body.email === "john@example.com"  # Email matches
      - body.createdAt !== null      # Has timestamp
      - time < 1000                  # Fast response

  - id: get-user
    name: Get User
    request:
      method: GET
      url: http://localhost:3000/users/123
    assertions:
      - statusCode === 200           # OK
      - body.id === 123              # Correct ID
      - body.email !== null          # Has email
      - typeof body.age === "number" || body.age === null  # Age is number or null
      - time < 500                   # Very fast

  - id: list-users
    name: List Users
    request:
      method: GET
      url: http://localhost:3000/users
    assertions:
      - statusCode === 200           # OK
      - Array.isArray(body.items)    # Is array
      - body.items.length > 0        # Has items
      - body.total >= body.items.length  # Total is accurate
```

## Error Handling

If an assertion fails, Zelte will report:
- The assertion expression
- Whether it passed or failed
- Any evaluation error message

```yaml
assertions:
  - statusCode === 200              # If false, reported as failed
  - body.user.name.includes("John") # If body.user is null, error is raised
```

## Tips & Best Practices

1. **Use strict equality**: Use `===` and `!==` instead of `==` and `!=`
2. **Check for existence**: Use `!== null` to verify a field exists
3. **Combine assertions**: Use logical operators (`&&`, `||`) for complex checks
4. **Keep assertions readable**: Break down complex expressions for clarity
5. **Use helper functions**: Use `get()` for deeply nested properties
