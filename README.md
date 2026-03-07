# Zelte

⚡ **Lightweight terminal-first API testing tool for backend engineers**

Zelte is a fast, zero-friction CLI tool for testing REST and GraphQL APIs directly from your terminal. Built for developers who value simplicity, speed, and reliability.

## ✨ Features

- **Lightweight & Fast**: Minimal dependencies, instant startup
- **Terminal-First**: Designed for CLI workflows and CI/CD pipelines
- **Multi-Format Support**: YAML and JSON collection files
- **Environment Variables**: Secure credential management with `.zelte.env` files
- **Multiple Authentication**: Bearer tokens, API keys, Basic auth, and environment inheritance
- **GraphQL Support**: Native GraphQL query testing with variable substitution
- **Flexible Assertions**: Built-in operators for status codes, response times, and data validation
- **Parallel Execution**: Run tests concurrently for faster feedback
- **Rich Output**: Table, JSON, TAP, and raw output formats
- **Watch Mode**: Auto-reload and re-run tests on file changes

## 🚀 Quick Start

### Installation

```bash
npm install -g zelte
```

### Create Your First Test

Create a `collection.yaml` file:

```yaml
version: '1.0'
name: My API Tests
description: Test my REST API endpoints

variables:
  base_url: https://api.example.com
  timeout: 5000

tests:
  - id: health-check
    name: Health Check
    request:
      method: GET
      url: ${base_url}/health
    assertions:
      - status == 200
      - body.status == "ok"

  - id: user-list
    name: Get User List
    request:
      method: GET
      url: ${base_url}/users
    assertions:
      - status == 200
      - body.users exists
      - body.users.length > 0
```

### Run Tests

```bash
# Run all tests
zelte run collection.yaml

# Run with specific environment
zelte run collection.yaml --env production

# Run with JSON output for CI
zelte run collection.yaml --output json

# Filter tests by name
zelte run collection.yaml --filter "health"
```

## 📖 Documentation

- [Installation](./docs/installation.md)
- [Getting Started](./docs/getting-started.md)
- [Collection Format](./docs/collection-format.md)
- [Environment Variables](./docs/environment-variables.md)
- [Authentication](./docs/authentication.md)
- [Assertions](./docs/assertions.md)
- [GraphQL Testing](./docs/graphql-testing.md)
- [CLI Reference](./docs/cli-reference.md)
- [CI/CD Integration](./docs/ci-cd.md)

## 🛠️ Commands

```bash
# Run tests from collection
zelte run [collection] [options]

# Validate collection file
zelte validate [collection]

# Initialize new project
zelte init

# Manage environment variables
zelte env [command]

# Watch for changes and auto-run
zelte watch [collection]

# Interactive test runner
zelte test [collection]

# Show help
zelte --help
```

## 📊 Example Output

```
Running collection: collection.yaml
✓ PASS: Health Check (23ms)
✓ PASS: Get User List (145ms)

Collection: collection.yaml
┌─────────┬──────────────┬─────────┬─────────┬─────────┐
│ (index) │     name     │  status │  time   │  error  │
├─────────┼──────────────┼─────────┼─────────┼─────────┤
│    0    │ 'Health Check' │ 'passed' │  '23ms' │   null  │
│    1    │ 'Get User List' │ 'passed' │ '145ms' │   null  │
└─────────┴──────────────┴─────────┴─────────┴─────────┘

Summary: 2 passed, 0 failed, 0 skipped (168ms)
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for backend engineers who love clean, fast tools.

---

**Built for speed. Designed for developers.**