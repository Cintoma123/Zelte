# Zelte

⚡ **Zero-Config API Testing for Backend Engineers**

Zelte is the simplest way to test your APIs. Just write tests and run `zelte run`. Everything else is auto-detected.

## ✨ Key Features

- **Zero Configuration** 🎯 No flags needed - `zelte run` just works
- **Auto-Detection** 🔍 Finds your config, env files, and collection automatically
- **Simple Syntax** ✍️ Write tests like you speak, not like code
- **REST & GraphQL** 🌐 Full support for both API types
- **Perfect for CLI** 💻 Terminal-first, CI/CD ready
- **Lightweight** ⚡ Minimal dependencies, fast startup
- **Multi-Format** 📄 YAML and JSON both supported

## 🚀 Quick Start (30 Seconds)

### 1. Create a test file

Save this as `tests.yaml`:
```yaml
post /auth/login
body:
  email: test@mail.com
  password: 123456
expect 200

---

get /api/profile
expect 200
```

### 2. Set your API endpoint

Create `.zelte.env`:
```env
API_URL=http://localhost:3000
```

### 3. Run tests

```bash
zelte run
```

**That's it!** No configuration files, no flags, no boilerplate.

---

## 📝 Example Output

```
🚀 Zelte - Zero-Config API Testing
📍 Auto-detecting configuration...
✓ Config: .zelte.json
✓ Environment: .zelte.env
✓ Base URL: http://localhost:3000
📂 Collection: tests.yaml
⚡ Running 5 tests...

✓ POST /auth/login (245ms)
✓ GET /api/profile (123ms)
✓ PUT /api/profile (189ms)
✓ DELETE /api/projects/123 (167ms)
✓ GET /api/users (298ms)

✓ All tests passed!
```

---

## 📖 Understanding Zero-Config

Zelte auto-detects everything by looking for standard files:

### Config Files (Searched in Order)
- `.zelte.json` ← Recommended
- `zelte.config.json`
- `.zelte.yaml`

### Environment Files (Searched in Order)
- `.zelte.env` ← Recommended
- `.env.local`
- `.env`

### Collection Files (Searched in Order)
- `collection.yaml`
- `tests.yaml`
- `collection.json`

### Base URL (Checked in Order)
1. `API_URL` / `BASE_URL` / `ZELTE_URL` environment variables
2. `baseUrl` in config file
3. Default: `http://localhost:3000`

No files match? Sensible defaults kick in. Everything just works.

---

## 📝 Minimal Example

Edit `tests.yaml`:

```yaml
version: '1.0'
name: Login API

variables:
  baseUrl: http://localhost:3000

tests:
  - id: login
    name: User Login
    request:
      method: POST
      url: ${baseUrl}/auth/login
      body:
        email: test@mail.com
        password: 123456
    assertions:
      - statusCode === 200
      - body.token !== null

  - id: get-profile
    name: Get Profile
    request:
      method: GET
      url: ${baseUrl}/users/me
    assertions:
      - statusCode === 200
```

Run it:

```bash
zelte run collection.yaml
```

Output:

```
Collection: Login API

Test Results:
─────────────────────────────────────────────────────
ID            Name              Status        Duration
─────────────────────────────────────────────────────
login         User Login        ✓ PASSED      123ms
get-profile   Get Profile       ✓ PASSED      89ms
─────────────────────────────────────────────────────

Summary:
  2 passed, 0 failed, 0 skipped
  Total: 2 tests in 212ms
```

---

## 📖 Documentation
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

- [Quick Start](./docs/getting-started-quick.md)
- [Assertions Guide](./docs/assertions.md)
- [Collection Format](./docs/collection-format.md)
- [Environment Variables](./docs/environment-variables.md)
- [GraphQL Testing](./docs/graphql-testing.md)
- [Examples](./examples/)

## 🛠️ Commands

```bash
# Initialize a new test collection
zelte init [directory]

# Run tests from a collection file
zelte run [collection-file] [options]
```

**Run Options:**

```bash
zelte run collection.yaml                  # Human-readable table output
zelte run collection.yaml --output json    # Machine-readable JSON
zelte run collection.yaml --env production # Load .zelte.env.production
zelte run collection.yaml --timeout 5000   # Custom timeout
zelte run collection.yaml --filter "login" # Run only matching tests
zelte run collection.yaml --verbose        # Show all details
```

## 📊 Output Example

Run tests:
```bash
$ zelte run collection.yaml
```

Get tabular results:
```
Collection: Login API

Test Results:
───────────────────────────────────────────────────
ID            Name              Status    Duration
───────────────────────────────────────────────────
login         User Login        ✓ PASSED  123ms
get-profile   Get Profile       ✓ PASSED  89ms
───────────────────────────────────────────────────

Summary:
  2 passed, 0 failed, 0 skipped
  Total: 2 tests in 212ms
```

Or JSON for CI:
```bash
$ zelte run collection.yaml --output json > results.json
```

## 🔗 Integration

## 🔗 Integration

**GitHub Actions:**
```yaml
- run: npm install -g zelte
- run: zelte run collection.yaml
```

**GitLab CI:**
```yaml
test:
  image: node:18
  script:
    - npm install -g zelte
    - zelte run collection.yaml
```

**npm as dev dependency:**
```bash
npm install --save-dev zelte
npx zelte run collection.yaml
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for backend engineers who value simplicity and speed.

---

**Simple. Fast. Effective.**