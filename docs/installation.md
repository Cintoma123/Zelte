# Installation

Zelte is designed to be simple to install and get started with. This guide covers installation options and system requirements.

## System Requirements

- **Node.js**: Version 16.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Package Manager**: npm (comes with Node.js)

## Quick Installation

### Global Installation (Recommended)

Install Zelte globally to use it from anywhere on your system:

```bash
npm install -g zelte
```

Verify the installation:

```bash
zelte --version
# Output: zelte/0.1.0 darwin-arm64 node-v18.17.0
```

### Local Installation

Install Zelte as a development dependency in your project:

```bash
npm install --save-dev zelte
```

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "test:api": "zelte run",
    "test:api:watch": "zelte watch",
    "test:api:validate": "zelte validate"
  }
}
```

Run tests using npm scripts:

```bash
npm run test:api
npm run test:api:watch
npm run test:api:validate
```

## Alternative Installation Methods

### Using Yarn

```bash
yarn global add zelte
```

### Using pnpm

```bash
pnpm add -g zelte
```

## Verification

After installation, verify Zelte is working correctly:

```bash
zelte --help
```

You should see the help output with available commands and options.

## Updating Zelte

To update to the latest version:

```bash
npm update -g zelte
```

Or for local installations:

```bash
npm update zelte
```

## Troubleshooting

### Permission Errors

If you encounter permission errors during global installation, you may need to use `sudo`:

```bash
sudo npm install -g zelte
```

**Note**: Using `sudo` with npm is generally not recommended. Consider using a Node.js version manager like [nvm](https://github.com/nvm-sh/nvm) instead.

### Command Not Found

If `zelte` command is not found after installation:

1. Check if npm global bin directory is in your PATH:
   ```bash
   npm config get prefix
   ```

2. Add the bin directory to your PATH in your shell profile:
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.profile
   export PATH="$PATH:$(npm config get prefix)/bin"
   ```

3. Reload your shell configuration:
   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

### Node.js Version Issues

Ensure you have a compatible Node.js version:

```bash
node --version
# Should be 16.0.0 or higher
```

If you need to update Node.js, consider using:
- [nvm](https://github.com/nvm-sh/nvm) (recommended for developers)
- [Node.js official installer](https://nodejs.org/)
- [Homebrew](https://brew.sh/) (macOS): `brew install node`

## Next Steps

After installation, proceed to:
- [Getting Started](./getting-started.md) - Learn the basics
- [Collection Format](./collection-format.md) - Understand test file structure
- [Environment Variables](./environment-variables.md) - Set up secure credential management