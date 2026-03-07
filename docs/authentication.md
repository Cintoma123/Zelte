# Authentication

Zelte supports multiple authentication methods to secure your API tests. This document covers all available authentication options and how to use them effectively.

## Supported Authentication Types

Zelte supports the following authentication methods:

1. **Bearer Token Authentication** - JWT tokens and API tokens
2. **API Key Authentication** - Custom header-based API keys
3. **Basic Authentication** - Username and password
4. **Environment Inheritance** - Variables from environment files

## Bearer Token Authentication

Bearer token authentication is the most common method for API authentication using JWT tokens or API tokens.

### Configuration

```yaml
tests:
  - name: Authenticated Request
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: ${API_BEARER_TOKEN}
    assertions:
      - status == 200
```

### Environment Variables

Store your bearer token in `.zelte.env`:

```bash
# .zelte.env
API_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Usage Examples

```yaml
# Simple bearer token
auth:
  type: bearer
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

# Using environment variable
auth:
  type: bearer
  token: ${API_TOKEN}

# Using extracted token from previous test
auth:
  type: bearer
  token: ${auth_token}
```

## API Key Authentication

API key authentication allows you to specify custom headers for API key-based authentication.

### Configuration

```yaml
tests:
  - name: API Key Protected Request
    request:
      method: GET
      url: ${base_url}/data
    auth:
      type: api-key
      header: X-API-Key
      value: ${API_KEY}
    assertions:
      - status == 200
```

### Environment Variables

```bash
# .zelte.env
API_KEY=your-api-key-here
```

### Usage Examples

```yaml
# Custom API key header
auth:
  type: api-key
  header: X-API-Key
  value: "your-api-key"

# Using environment variable
auth:
  type: api-key
  header: X-API-Key
  value: ${API_KEY}

# Different header names
auth:
  type: api-key
  header: Authorization
  value: "ApiKey your-key-here"

auth:
  type: api-key
  header: X-Auth-Token
  value: ${AUTH_TOKEN}
```

## Basic Authentication

Basic authentication uses username and password encoded in Base64.

### Configuration

```yaml
tests:
  - name: Basic Auth Request
    request:
      method: GET
      url: ${base_url}/admin
    auth:
      type: basic
      username: ${API_USERNAME}
      password: ${API_PASSWORD}
    assertions:
      - status == 200
```

### Environment Variables

```bash
# .zelte.env
API_USERNAME=admin
API_PASSWORD=secret123
```

### Usage Examples

```yaml
# Direct credentials
auth:
  type: basic
  username: "admin"
  password: "password123"

# Using environment variables
auth:
  type: basic
  username: ${USERNAME}
  password: ${PASSWORD}

# Using extracted credentials
auth:
  type: basic
  username: ${user_email}
  password: ${user_password}
```

## Environment Inheritance

Environment inheritance allows you to use authentication values directly from environment variables without specifying a specific auth type.

### Configuration

```yaml
tests:
  - name: Environment Auth Request
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: inherit-from-env
      header: Authorization
      value: ${AUTH_HEADER}
    assertions:
      - status == 200
```

### Environment Variables

```bash
# .zelte.env
AUTH_HEADER=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Authentication in GraphQL Tests

All authentication methods work with GraphQL tests as well:

```yaml
graphql:
  - name: Authenticated GraphQL Query
    endpoint: ${base_url}/graphql
    query: |
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    variables:
      id: "123"
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 200
      - data.data.user.id == "123"
```

## Authentication Best Practices

### 1. Use Environment Variables

Never hardcode authentication credentials in your test files:

```yaml
# ❌ Bad - Hardcoded credentials
auth:
  type: bearer
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ✅ Good - Environment variables
auth:
  type: bearer
  token: ${API_TOKEN}
```

### 2. Create Environment Files

Use `.zelte.env` files for credential management:

```bash
# .zelte.env (never commit this file!)
API_TOKEN=your-secret-token
API_USERNAME=admin
API_PASSWORD=secret123
API_KEY=your-api-key
```

### 3. Provide Example Files

Create `.zelte.env.example` for team members:

```bash
# .zelte.env.example
API_TOKEN=your-token-here
API_USERNAME=your-username
API_PASSWORD=your-password
API_KEY=your-api-key
```

### 4. Use Different Credentials per Environment

Create environment-specific files:

```bash
# .zelte.env.development
API_TOKEN=dev-token-here
API_BASE_URL=https://dev-api.example.com

# .zelte.env.production
API_TOKEN=prod-token-here
API_BASE_URL=https://api.example.com
```

### 5. Rotate Credentials Regularly

Update your environment files when credentials change:

```bash
# Update .zelte.env
API_TOKEN=new-token-after-rotation
```

## Authentication Examples

### Complete Authentication Example

```yaml
version: '1.0'
name: Authentication Examples
description: Various authentication methods

variables:
  base_url: ${API_BASE_URL}

tests:
  # Bearer Token Authentication
  - id: bearer-auth
    name: Bearer Token Authentication
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: ${API_BEARER_TOKEN}
    assertions:
      - status == 200

  # API Key Authentication
  - id: api-key-auth
    name: API Key Authentication
    request:
      method: GET
      url: ${base_url}/data
    auth:
      type: api-key
      header: X-API-Key
      value: ${API_KEY}
    assertions:
      - status == 200

  # Basic Authentication
  - id: basic-auth
    name: Basic Authentication
    request:
      method: GET
      url: ${base_url}/admin
    auth:
      type: basic
      username: ${API_USERNAME}
      password: ${API_PASSWORD}
    assertions:
      - status == 200

  # Environment Inheritance
  - id: env-inheritance
    name: Environment Inheritance
    request:
      method: GET
      url: ${base_url}/custom
    auth:
      type: inherit-from-env
      header: Authorization
      value: ${AUTH_HEADER}
    assertions:
      - status == 200

  # Authentication with Variable Extraction
  - id: auth-with-extraction
    name: Authentication with Variable Extraction
    request:
      method: POST
      url: ${base_url}/auth/login
      body:
        username: ${API_USERNAME}
        password: ${API_PASSWORD}
    assertions:
      - status == 200
      - body.token exists
    expect:
      variables:
        auth_token: data.token

  # Using Extracted Token
  - id: use-extracted-token
    name: Use Extracted Token
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: ${auth_token}
    assertions:
      - status == 200
```

### OAuth2 Flow Example

While Zelte doesn't have built-in OAuth2 support, you can implement OAuth2 flows manually:

```yaml
version: '1.0'
name: OAuth2 Flow Example
description: Manual OAuth2 implementation

variables:
  base_url: ${API_BASE_URL}

tests:
  # Get OAuth2 Token
  - id: oauth-token
    name: Get OAuth2 Token
    request:
      method: POST
      url: ${base_url}/oauth/token
      headers:
        Content-Type: application/x-www-form-urlencoded
      body: grant_type=client_credentials&client_id=${OAUTH_CLIENT_ID}&client_secret=${OAUTH_CLIENT_SECRET}
    assertions:
      - status == 200
      - body.access_token exists
      - body.token_type == "Bearer"
    expect:
      variables:
        oauth_token: data.access_token

  # Use OAuth2 Token
  - id: oauth-protected
    name: OAuth2 Protected Request
    request:
      method: GET
      url: ${base_url}/protected
    auth:
      type: bearer
      token: ${oauth_token}
    assertions:
      - status == 200
```

## Troubleshooting Authentication

### Common Issues

1. **Token Not Found**: Ensure environment variables are properly set
2. **Invalid Token**: Check token format and expiration
3. **Missing Headers**: Verify authentication headers are being sent
4. **Permission Denied**: Check API permissions and scopes

### Debug Authentication

Use verbose mode to see authentication headers:

```bash
zelte run collection.yaml --verbose
```

This will show the actual headers being sent, including authentication headers.

## Security Considerations

1. **Never commit credentials**: Always use `.gitignore` to exclude `.zelte.env` files
2. **Use strong credentials**: Generate strong, unique tokens and passwords
3. **Limit token scope**: Use tokens with minimal required permissions
4. **Monitor usage**: Track authentication failures and unusual activity
5. **Regular rotation**: Change credentials regularly as part of security best practices

By following these authentication practices, you can securely test authenticated APIs while maintaining good security hygiene in your development workflow.