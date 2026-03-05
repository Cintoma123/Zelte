#!/usr/bin/env node

/**
 * Zelte CLI Entry Point
 * Lightweight terminal-first API testing tool for backend engineers
 * 
 * Architecture:
 * - Command routing via Commander.js
 * - Global error handling with graceful exits
 * - Configurable logging with verbosity levels
 * - Multiple output formatters (table, JSON, TAP, raw)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { runCommand } from './commands/run';
import { testCommand } from './commands/test';
import { validateCommand } from './commands/validate';
import { initCommand } from './commands/init';
import { envCommand } from './commands/env';
import { watchCommand } from './commands/watch';
import { interactiveCommand } from './commands/interactive';
import { logger, configureLogger } from '../utils/logger';
import { showWelcomeScreen, shouldShowWelcome } from './welcome';

const program = new Command();

// Set up the main program
program
  .name('zelte')
  .description('⚡ Lightweight terminal-first API testing tool for backend engineers')
  .version('0.1.0', '-v, --version')
  .helpOption('-h, --help')
  .option('--verbose', 'enable verbose logging')
  .option('--debug', 'enable debug logging')
  .option('--config <path>', 'path to configuration file')
  .option('--no-color', 'disable colored output in all commands')
  .hook('preAction', (command, actionCommand) => {
    // Configure logger before executing any command
    const options = actionCommand.optsWithGlobals();
    if (options.verbose) {
      configureLogger({ verbose: true, level: 'info' });
    }
    if (options.debug) {
      configureLogger({ verbose: true, level: 'debug' });
    }
  });

// Register all commands
program.addCommand(runCommand);
program.addCommand(testCommand);
program.addCommand(validateCommand);
program.addCommand(initCommand);
program.addCommand(envCommand);
program.addCommand(watchCommand);
program.addCommand(interactiveCommand);

// Configure help and usage
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + (cmd.alias() ? ' | ' + cmd.alias() : ''),
});

// Custom help text
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  # Run tests from a YAML collection');
  console.log('  $ zelte run ./api-tests.zelte.yaml');
  console.log('');
  console.log('  # Run tests from a JSON collection');
  console.log('  $ zelte run ./api-tests.zelte.json');
  console.log('');
  console.log('  # Run with specific environment');
  console.log('  $ zelte run ./api-tests.zelte.yaml --env production');
  console.log('');
  console.log('  # Run with JSON output for CI integration');
  console.log('  $ zelte run ./api-tests.zelte.yaml --output json > results.json');
  console.log('');
  console.log('  # Validate collection file');
  console.log('  $ zelte validate ./api-tests.zelte.json');
  console.log('');
  console.log('  # Initialize a new project');
  console.log('  $ zelte init');
  console.log('');
  console.log('Documentation: https://github.com/Cintoma123/zelte');
  console.log('');
});

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.version') {
    process.exit(0);
  }
  
  logger.error('Command failed:', err.message);
  process.exit(1);
});

// Handle no command provided
program.configureOutput({
  outputError: (str, write) => {
    write(chalk.red('Error: ' + str));
  },
});

// Parse arguments and execute
(async () => {
  try {
    // Check if we should show the welcome screen
    if (shouldShowWelcome(process.argv)) {
      showWelcomeScreen(program);
      process.exit(0);
    }

    await program.parseAsync();

    // If no command provided, show help (fallback)
    if (!process.argv.slice(2).length) {
      program.outputHelp();
      process.exit(0);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Fatal error:', error.message);
      if (error.stack) {
        logger.debug(error.stack);
      }
    }
    process.exit(1);
  }
})();
