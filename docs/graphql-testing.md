# GraphQL Testing

Zelte provides native support for testing GraphQL APIs alongside REST endpoints. This document covers how to write and execute GraphQL tests effectively.

## Overview

GraphQL tests in Zelte allow you to:
- Execute GraphQL queries and mutations
- Validate GraphQL responses
- Use variables in your GraphQL operations
- Apply authentication to GraphQL endpoints
- Extract data for use in subsequent tests

## GraphQL Test Structure

GraphQL tests have a specific structure that differs from REST tests:

```yaml
graphql:
  - id: "unique-test-id"
    name: "GraphQL Test Name"
    description: "Test description"
    skip: false
    
    endpoint: "https://api.example.com/graphql" # Required: GraphQL endpoint URL
    method: POST                               # Optional: HTTP method (default: POST)
    
    query: |                                   # Required: GraphQL query/mutation
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

## Basic GraphQL Query

### Simple Query

```yaml
graphql:
  - name: Get User
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
    assertions:
      - status == 200
      - data.data.user.id == "123"
      - data.data.user.name == "John Doe"
```

### Query with Multiple Fields

```yaml
graphql:
  - name: Get User with Posts
    endpoint: ${base_url}/graphql
    query: |
      query GetUserWithPosts($id: ID!) {
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
    variables:
      id: "123"
    assertions:
      - status == 200
      - data.data.user.posts.length > 0
      - data.data.user.posts[0].title exists
```

## GraphQL Mutations

### Basic Mutation

```yaml
graphql:
  - name: Create User
    endpoint: ${base_url}/graphql
    query: |
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    variables:
      input:
        name: "Jane Doe"
        email: "jane@example.com"
    assertions:
      - status == 200
      - data.data.createUser.id exists
      - data.data.createUser.name == "Jane Doe"
```

### Mutation with Error Handling

```yaml
graphql:
  - name: Create User with Validation Error
    endpoint: ${base_url}/graphql
    query: |
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    variables:
      input:
        name: ""
        email: "invalid-email"
    assertions:
      - status == 200
      - data.errors exists
      - data.errors[0].message contains "name is required"
```

## GraphQL Variables

### Using Variables in Queries

```yaml
graphql:
  - name: Get User by ID
    endpoint: ${base_url}/graphql
    query: |
      query GetUser($id: ID!, $includePosts: Boolean!) {
        user(id: $id) {
          id
          name
          email
          posts @include(if: $includePosts) {
            id
            title
          }
        }
      }
    variables:
      id: "123"
      includePosts: true
    assertions:
      - status == 200
      - data.data.user.posts exists
```

### Complex Variables

```yaml
graphql:
  - name: Search Users
    endpoint: ${base_url}/graphql
    query: |
      query SearchUsers($filter: UserFilter!, $pagination: PaginationInput!) {
        searchUsers(filter: $filter, pagination: $pagination) {
          users {
            id
            name
            email
          }
          totalCount
          hasNextPage
        }
      }
    variables:
      filter:
        active: true
        role: "USER"
      pagination:
        limit: 10
        offset: 0
    assertions:
      - status == 200
      - data.data.searchUsers.users.length > 0
      - data.data.searchUsers.totalCount > 0
```

## Authentication in GraphQL

### Bearer Token Authentication

```yaml
graphql:
  - name: Authenticated GraphQL Query
    endpoint: ${base_url}/graphql
    query: |
      query GetUser {
        me {
          id
          name
          email
        }
      }
    auth:
      type: bearer
      token: ${API_TOKEN}
    assertions:
      - status == 200
      - data.data.me.id exists
```

### API Key Authentication

```yaml
graphql:
  - name: API Key Protected Query
    endpoint: ${base_url}/graphql
    query: |
      query GetData {
        protectedData {
          id
          value
        }
      }
    auth:
      type: api-key
      header: X-API-Key
      value: ${API_KEY}
    assertions:
      - status == 200
      - data.data.protectedData exists
```

## GraphQL Assertions

### Status Code Assertions

```yaml
assertions:
  - status == 200
  - status != 404
```

### GraphQL Response Structure

GraphQL responses have a specific structure:
- `data` - Contains the query results
- `errors` - Contains any GraphQL errors
- `extensions` - Contains additional metadata

```yaml
assertions:
  - data exists                    # GraphQL response has data field
  - data.user exists              # Query result exists
  - data.user.id == "123"         # Specific field value
  - errors == null                # No GraphQL errors
```

### Error Handling

```yaml
assertions:
  - status == 200                  # HTTP status is 200 (GraphQL errors return 200)
  - data == null                   # No data returned due to error
  - errors exists                  # GraphQL errors present
  - errors[0].message contains "not found"  # Specific error message
```

### Nested Data Assertions

```yaml
assertions:
  - data.data.user.id == "123"
  - data.data.user.profile.email == "john@example.com"
  - data.data.user.posts[0].title == "First Post"
  - data.data.user.posts.length > 0
```

## Variable Extraction in GraphQL

Extract values from GraphQL responses for use in subsequent tests:

```yaml
graphql:
  - id: create-user
    name: Create User
    endpoint: ${base_url}/graphql
    query: |
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    variables:
      input:
        name: "John Doe"
        email: "john@example.com"
    assertions:
      - status == 200
      - data.data.createUser.id exists
    expect:
      variables:
        user_id: data.data.createUser.id
        user_email: data.data.createUser.email

  - id: get-created-user
    name: Get Created User
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
      id: ${user_id}
    assertions:
      - status == 200
      - data.data.user.email == ${user_email}
```

## GraphQL Best Practices

### 1. Use Descriptive Names

```yaml
# ❌ Bad
graphql:
  - name: "Test 1"
    query: "query { user { id } }"

# ✅ Good
graphql:
  - name: "Get User Profile"
    query: |
      query GetUserProfile($id: ID!) {
        user(id: $id) {
          id
          name
          email
          profile {
            bio
            avatar
          }
        }
      }
```

### 2. Test Both Success and Error Cases

```yaml
# Success case
- name: Valid Query
  query: "query { user(id: \"123\") { id } }"
  assertions:
    - status == 200
    - data.data.user.id == "123"

# Error case
- name: Invalid ID
  query: "query { user(id: \"invalid\") { id } }"
  assertions:
    - status == 200
    - errors exists
    - errors[0].message contains "invalid ID"
```

### 3. Use Variables for Dynamic Data

```yaml
# ❌ Hardcoded values
query: "query { user(id: \"123\") { id } }"

# ✅ Using variables
query: |
  query GetUser($id: ID!) {
    user(id: $id) {
      id
    }
  }
variables:
  id: "123"
```

### 4. Test Field Selection

```yaml
- name: Test Field Selection
  query: |
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        # Don't request unnecessary fields
      }
    }
  variables:
    id: "123"
  assertions:
    - status == 200
    - data.data.user.id exists
    - data.data.user.name exists
    - data.data.user.email == null  # Not requested
```

## Common GraphQL Test Patterns

### Authentication Flow

```yaml
graphql:
  # Login mutation
  - id: login
    name: User Login
    endpoint: ${base_url}/graphql
    query: |
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
          user {
            id
            name
          }
        }
      }
    variables:
      input:
        email: ${USER_EMAIL}
        password: ${USER_PASSWORD}
    assertions:
      - status == 200
      - data.data.login.token exists
    expect:
      variables:
        auth_token: data.data.login.token
        user_id: data.data.login.user.id

  # Authenticated query
  - id: get-profile
    name: Get User Profile
    endpoint: ${base_url}/graphql
    query: |
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          profile {
            bio
            avatar
          }
        }
      }
    variables:
      id: ${user_id}
    auth:
      type: bearer
      token: ${auth_token}
    assertions:
      - status == 200
      - data.data.user.id == ${user_id}
```

### Pagination Testing

```yaml
graphql:
  - name: First Page
    endpoint: ${base_url}/graphql
    query: |
      query GetUsers($pagination: PaginationInput!) {
        users(pagination: $pagination) {
          items {
            id
            name
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            totalCount
          }
        }
      }
    variables:
      pagination:
        limit: 10
        offset: 0
    assertions:
      - status == 200
      - data.data.users.items.length == 10
      - data.data.users.pageInfo.hasNextPage == true

  - name: Second Page
    endpoint: ${base_url}/graphql
    query: |
      query GetUsers($pagination: PaginationInput!) {
        users(pagination: $pagination) {
          items {
            id
            name
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            totalCount
          }
        }
      }
    variables:
      pagination:
        limit: 10
        offset: 10
    assertions:
      - status == 200
      - data.data.users.items.length == 10
```

### Subscription Testing (HTTP-based)

Note: True GraphQL subscriptions require WebSocket connections, but you can test subscription endpoints that use HTTP polling:

```yaml
graphql:
  - name: Subscription Polling
    endpoint: ${base_url}/graphql
    query: |
      subscription OnUserUpdated {
        userUpdated {
          id
          name
          updatedAt
        }
      }
    assertions:
      - status == 200
      - data.data.userUpdated exists
```

## Troubleshooting GraphQL Tests

### Common Issues

1. **Syntax Errors**: Ensure GraphQL syntax is correct
2. **Variable Types**: Match variable types with schema definitions
3. **Authentication**: Verify auth headers are properly set
4. **Error Handling**: GraphQL errors return HTTP 200 with error data

### Debug Tips

1. **Use Verbose Mode**: Run with `--verbose` to see full responses
2. **Check Schema**: Verify field names match your GraphQL schema
3. **Test Variables**: Ensure variables are properly formatted
4. **Error Inspection**: Check both `data` and `errors` fields

### Example Debug Session

```yaml
# Start with simple query
query: "query { user { id } }"
assertions:
  - status == 200

# Add variables
query: "query GetUser($id: ID!) { user(id: $id) { id } }"
variables:
  id: "123"
assertions:
  - status == 200
  - data.data.user.id == "123"

# Add more fields
query: |
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
assertions:
  - status == 200
  - data.data.user.id == "123"
  - data.data.user.name exists
  - data.data.user.email exists
```

By following these patterns and best practices, you can create comprehensive GraphQL test suites that validate your API's query capabilities, mutations, and error handling effectively.