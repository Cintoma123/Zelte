# CLI Reference

This document provides comprehensive reference information for all Zelte CLI commands and options.

## Command Overview

Zelte provides several commands for different testing scenarios:

- `run` - Execute tests from a collection file
- `validate` - Validate collection and environment files
- `init` - Initialize a new Zelte project
- `env` - Manage environment variables
- `watch` - Watch for file changes and auto-run tests
- `test` - Interactive test runner
- `help` - Show help information

## Global Options

All commands support these global options:

```bash
--verbose, -v     Enable verbose logging
--debug           Enable debug logging  
--config <path>   Path to configuration file
--no-color        Disable colored output
--help, -h        Show help information
--version, -v     Show version information
```

## Run Command

Execute API requests from a collection file.

### Syntax

```bash
zelte run [collection] [options]
```

### Arguments

- `collection` - Path to collection file (*.yaml or *.json) - Default: `collection.yaml`

### Options

```bash
-e, --env <name>              Environment to use
-o, --output <format>         Output format (table, json, tap, raw) - Default: table
--timeout <ms>                Request timeout in milliseconds - Default: 30000
--parallel                    Enable parallel request execution
--serial                      Run tests sequentially (opposite of --parallel)
--filter <pattern>            Regex pattern to filter tests by name or id
--verbose                     Verbose output with request/response details
--metrics                     Show detailed performance metrics
--no-colors                   Disable colored output
--save-results <path>         Save results to file
```

### Examples

```bash
# Run all tests from YAML file
zelte run collection.yaml

# Run all tests from JSON file
zelte run collection.json

# Run with specific environment
zelte run collection.yaml --env production

# Run with JSON output for CI/CD
zelte run collection.yaml --output json

# Run with verbose output
zelte run collection.yaml --verbose

# Filter tests by name
zelte run collection.yaml --filter "auth"

# Run tests in parallel
zelte run collection.yaml --parallel

# Run tests sequentially
zelte run collection.yaml --serial

# Set custom timeout
zelte run collection.yaml --timeout 10000

# Save results to file
zelte run collection.yaml --save-results results.json
```

### Output Formats

#### Table Format (Default)

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

#### JSON Format

```json
{
  "name": "collection.yaml",
  "tests": [
    {
      "id": "health-check",
      "name": "Health Check",
      "status": "passed",
      "duration": 234,
      "error": null,
      "assertions": [
        {
          "name": "status == 200",
          "passed": true,
          "error": null
        }
      ]
    }
  ],
  "summary": {
    "total": 1,
    "passed": 1,
    "failed": 0,
    "skipped": 0,
    "duration": 234
  }
}
```

#### TAP Format

```
TAP version 13
1..2
ok 1 - Health Check
ok 2 - Create New Post
```

#### Raw Format

```
Health Check: PASSED (234ms)
Create New Post: PASSED (156ms)
```

## Validate Command

Validate collection and environment files without executing tests.

### Syntax

```bash
zelte validate [path] [options]
```

### Arguments

- `path` - Path to collection file (*.yaml or *.json) - Default: `collection.yaml`

### Options

```bash
-e, --env <name>    Environment file to validate
```

### Examples

```bash
# Validate collection file
zelte validate collection.yaml

# Validate with specific environment
zelte validate collection.yaml --env production

# Validate JSON collection
zelte validate collection.json
```

## Init Command

Initialize a new Zelte project with example files.

### Syntax

```bash
zelte init [options]
```

### Options

```bash
--force    Overwrite existing files
--template <name>    Use specific template
```

### Examples

```bash
# Initialize with default template
zelte init

# Force overwrite existing files
zelte init --force

# Use specific template
zelte init --template api-tests
```

## Env Command

Manage environment variables for your project.

### Syntax

```bash
zelte env [command] [options]
```

### Subcommands

```bash
list        List all environment variables
get <key>   Get value of specific environment variable
set <key> <value>   Set environment variable
delete <key>        Delete environment variable
edit          Open environment file in editor
create <name>   Create new environment file
```

### Examples

```bash
# List all environment variables
zelte env list

# Get specific variable
zelte env get API_TOKEN

# Set environment variable
zelte env set API_TOKEN "your-token-here"

# Delete environment variable
zelte env delete API_TOKEN

# Edit environment file
zelte env edit

# Create new environment
zelte env create staging
```

## Watch Command

Watch for file changes and auto-run tests.

### Syntax

```bash
zelte watch [collection] [options]
```

### Arguments

- `collection` - Path to collection file (*.yaml or *.json) - Default: `collection.yaml`

### Options

```bash
-e, --env <name>              Environment to use
--filter <pattern>            Regex pattern to filter tests
--delay <ms>                  Delay before running tests after file change - Default: 500
--ignore <pattern>            File patterns to ignore
```

### Examples

```bash
# Watch collection file
zelte watch collection.yaml

# Watch with specific environment
zelte watch collection.yaml --env development

# Watch with test filter
zelte watch collection.yaml --filter "auth"

# Set custom delay
zelte watch collection.yaml --delay 1000

# Ignore specific files
zelte watch collection.yaml --ignore "*.tmp"
```

## Test Command

Interactive test runner for manual testing.

### Syntax

```bash
zelte test [collection] [options]
```

### Arguments

- `collection` - Path to collection file (*.yaml or *.json) - Default: `collection.yaml`

### Options

```bash
-e, --env <name>              Environment to use
--filter <pattern>            Regex pattern to filter tests
--interactive                 Force interactive mode
```

### Examples

```bash
# Run interactive tests
zelte test collection.yaml

# Run with specific environment
zelte test collection.yaml --env staging

# Filter tests
zelte test collection.yaml --filter "user"
```

## Configuration Options

### Environment Variables

Zelte respects these environment variables:

```bash
ZELTE_VERBOSE=true          Enable verbose logging
ZELTE_DEBUG=true            Enable debug logging
ZELTE_NO_COLOR=true         Disable colored output
ZELTE_TIMEOUT=30000         Default request timeout
ZELTE_PARALLEL=true         Enable parallel execution by default
```

### Configuration File

Create a `.zelte.config.js` file in your project root:

```javascript
module.exports = {
  timeout: 30000,
  parallel: true,
  verbose: false,
  output: 'table',
  environments: {
    development: {
      timeout: 10000,
      verbose: true
    },
    production: {
      timeout: 60000,
      parallel: false
    }
  }
};
```

## Exit Codes

Zelte uses standard exit codes:

- `0` - Success (all tests passed)
- `1` - Failure (one or more tests failed)
- `2` - Validation error (invalid collection file)
- `3` - Configuration error
- `4` - System error

## Error Handling

### Common Errors

```bash
# File not found
Error: Failed to load collection file 'collection.yaml': ENOENT: no such file or directory

# Invalid YAML/JSON
Error: Invalid YAML format: YAMLException: end of the stream or a document separator is expected

# Authentication failure
Error: Request failed: 401 Unauthorized

# Network error
Error: Request failed: ECONNREFUSED
```

### Debug Mode

Use `--verbose` or `--debug` flags for detailed error information:

```bash
zelte run collection.yaml --verbose
zelte run collection.yaml --debug
```

## Performance Tuning

### Parallel Execution

```bash
# Enable parallel execution (faster)
zelte run collection.yaml --parallel

# Disable parallel execution (safer for stateful tests)
zelte run collection.yaml --serial
```

### Timeout Configuration

```bash
# Set longer timeout for slow APIs
zelte run collection.yaml --timeout 60000

# Set shorter timeout for fast APIs
zelte run collection.yaml --timeout 5000
```

### Memory Usage

For large collections, consider:

```bash
# Use serial execution to reduce memory usage
zelte run collection.yaml --serial

# Filter tests to run smaller subsets
zelte run collection.yaml --filter "critical"
```

## Integration Examples

### CI/CD Pipeline

```yaml
# GitHub Actions
- name: Run API Tests
  run: zelte run collection.yaml --output json --save-results results.json
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}

# Jenkins
zelte run collection.yaml --output tap | tee results.tap
```

### Docker

```dockerfile
FROM node:18-alpine
RUN npm install -g zelte
COPY collection.yaml /app/
WORKDIR /app
CMD ["zelte", "run", "collection.yaml"]
```

### Makefile

```makefile
test-api:
	zelte run collection.yaml

test-api-ci:
	zelte run collection.yaml --output json --save-results results.json

validate:
	zelte validate collection.yaml

watch:
	zelte watch collection.yaml
```

This comprehensive CLI reference should help you use all of Zelte's features effectively in your testing workflows.