# Environment Variables for Sensitive Data

This guide explains how to use environment variables in Zelte to securely store sensitive information like API keys, passwords, and tokens.

## Why Use Environment Variables?

Storing sensitive data directly in test files is a security risk because:
- Credentials are exposed in plain text
- They can be accidentally committed to version control
- They're visible to anyone with access to the test files
- They make it difficult to use different credentials across environments

## How It Works

Zelte automatically loads environment variables from `.zelte.env` files and makes them available for variable substitution in your test files.

### Variable Substitution Syntax

Use the `${VARIABLE_NAME}` syntax to reference environment variables:

```yaml
tests:
  - name: API Test
    request:
      url: ${API_BASE_URL}/endpoint
      headers:
        Authorization: Bearer ${API_TOKEN}
    body:
      username: ${API_USERNAME}
      password: ${API_PASSWORD}
```

### Environment File Structure

Create a `.zelte.env` file in your project root:

```bash
# .zelte.env
API_BASE_URL=https://api.example.com
API_TOKEN=your-secret-token-here
API_USERNAME=testuser
API_PASSWORD=supersecretpassword
```

### Environment-Specific Files

You can create environment-specific files:

- `.zelte.env` - Default environment
- `.zelte.env.development` - Development environment
- `.zelte.env.staging` - Staging environment
- `.zelte.env.production` - Production environment

Load a specific environment with the `--env` flag:

```bash
zelte run --env staging
```

## Security Best Practices

### 1. Never Commit Sensitive Files

Add sensitive files to `.gitignore`:

```bash
# .gitignore
.zelte.env
.zelte.env.*
```

### 2. Create Example Files

Provide example files with placeholder values:

```bash
# .zelte.env.example
API_BASE_URL=https://api.example.com
API_TOKEN=your-token-here
API_USERNAME=your-username
API_PASSWORD=your-password
```

### 3. Use Different Credentials per Environment

```bash
# .zelte.env.development
API_BASE_URL=https://dev-api.example.com
API_TOKEN=dev-token-here

# .zelte.env.production
API_BASE_URL=https://api.example.com
API_TOKEN=prod-token-here
```

### 4. Rotate Credentials Regularly

Update your environment files when credentials change:

```bash
# Update .zelte.env
API_TOKEN=new-token-after-rotation
```

## Supported Authentication Types

### Bearer Token Authentication

```yaml
tests:
  - name: Bearer Auth Test
    request:
      url: ${API_BASE_URL}/protected
      headers:
        Authorization: Bearer ${API_TOKEN}
```

### Basic Authentication

```yaml
tests:
  - name: Basic Auth Test
    request:
      url: ${API_BASE_URL}/protected
      auth:
        type: basic
        username: ${API_USERNAME}
        password: ${API_PASSWORD}
```

### API Key Authentication

```yaml
tests:
  - name: API Key Test
    request:
      url: ${API_BASE_URL}/data
      headers:
        X-API-Key: ${API_KEY}
```

### OAuth Authentication

```yaml
tests:
  - name: OAuth Test
    request:
      url: ${API_BASE_URL}/oauth/token
      body:
        grant_type: client_credentials
        client_id: ${OAUTH_CLIENT_ID}
        client_secret: ${OAUTH_CLIENT_SECRET}
```

## Variable Scope and Precedence

Variables are resolved in this order:

1. **Test Variables** - Defined in the test's `variables` section
2. **Collection Variables** - Defined in the collection's `variables` section
3. **Environment Variables** - Loaded from `.zelte.env` files
4. **System Environment** - OS environment variables

```yaml
variables:
  base_url: ${API_BASE_URL}  # From .zelte.env

tests:
  - name: Test with Local Variables
    variables:
      user_id: 123
    request:
      url: ${base_url}/users/${user_id}  # user_id from test, base_url from env
```

## Examples

### Complete API Test Suite

See `examples/api-tests.yaml` for a complete example showing:
- Authentication tests with environment variables
- Protected endpoint testing
- OAuth flow testing
- GraphQL authentication

### Database Connection Test

```yaml
tests:
  - name: Database Connection Test
    request:
      method: POST
      url: ${DB_HOST}:${DB_PORT}/connect
      body:
        database: ${DB_NAME}
        username: ${DB_USER}
        password: ${DB_PASSWORD}
```

### Third-Party API Integration

```yaml
tests:
  - name: SendGrid Email Test
    request:
      method: POST
      url: https://api.sendgrid.com/v3/mail/send
      headers:
        Authorization: Bearer ${SENDGRID_API_KEY}
        Content-Type: application/json
      body:
        personalizations: [...]
        from: { email: ${SENDER_EMAIL} }
```

## Troubleshooting

### Variable Not Found Error

If you see "Variable not found: ${VARIABLE_NAME}", check:
1. The variable is defined in your `.zelte.env` file
2. The environment file is in the correct location
3. You're using the correct environment name with `--env`

### Environment File Not Loading

Ensure:
1. The file is named correctly (`.zelte.env` or `.zelte.env.[name]`)
2. The file is in your project root directory
3. The file has the correct permissions

### Sensitive Data Still Visible

If sensitive data appears in test output:
1. Check that variables are properly referenced with `${}` syntax
2. Verify the environment file contains the actual values
3. Ensure the environment file is not committed to version control

## Migration Guide

### From Hardcoded Values

**Before:**
```yaml
tests:
  - name: API Test
    request:
      url: https://api.example.com/data
      headers:
        Authorization: Bearer secret-token-123
```

**After:**
```yaml
# .zelte.env
API_BASE_URL=https://api.example.com
API_TOKEN=secret-token-123

# test file
tests:
  - name: API Test
    request:
      url: ${API_BASE_URL}/data
      headers:
        Authorization: Bearer ${API_TOKEN}
```

This migration improves security and makes your tests more maintainable across different environments.