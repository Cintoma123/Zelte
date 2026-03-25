#!/usr/bin/env node

/**
 * Zelte CLI Entry Point
 * 
 * ⚡ Simple API testing tool for backend engineers
 * 
 * TWO CORE COMMANDS:
 * 1. run   - Execute API tests (auto-detects configuration)
 * 2. init  - Initialize a new Zelte project
 * 
 * Design Principle: Convention over Configuration
 * - Auto-detects collection files, env files, base URLs
 * - Zero configuration flags needed in most cases
 * - Fast, simple, focused
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { runCommand } from './commands/run';
import { initCommand } from './commands/init';
import { showWelcomeScreen, shouldShowWelcome } from './welcome';
import { logger, configureLogger } from '../utils/logger';

const program = new Command();

// Configure main program
program
  .name('zelte')
  .description('⚡ Simple, lightweight API testing for backend engineers')
  .version('0.1.0', '-v, --version')
  .helpOption('-h, --help')
  .option('--verbose', 'enable verbose output')
  .option('--no-color', 'disable colored output')
  .hook('preAction', (command, actionCommand) => {
    // Configure logger before executing command
    const options = actionCommand.optsWithGlobals();
    if (options.verbose) {
      configureLogger();
    }
  });

// Register ONLY implemented commands
program.addCommand(runCommand);
program.addCommand(initCommand);

// Configure help display with custom formatting
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => chalk.blue(cmd.name()),
});

// Custom formatter for the help output
program.configureOutput({
  writeOut: (str) => {
    // Color the entire help output
    let output = str;
    
    // Color Usage section
    output = output.replace(/^Usage:/, chalk.bold.blue('Usage:'));
    
    // Color Options section
    output = output.replace(/^Options:/m, chalk.bold.blue('Options:'));
    
    // Color Commands section
    output = output.replace(/^Commands:/m, chalk.bold.blue('Commands:'));
    
    // Color all flag options (--flag, -f)
    output = output.replace(/-{1,2}[a-z-]+/g, (match) => chalk.cyan(match));
    
    // Color command names (run, init, help)
    output = output.replace(/(\s{2})(run|init|help)(\s{2,})/g, (match, space, cmd, space2) => {
      return space + chalk.greenBright(cmd) + space2;
    });
    
    // Color the description line
    output = output.replace(/⚡ Simple, lightweight API testing for backend engineers/, chalk.gray('⚡ Simple, lightweight API testing for backend engineers'));
    
    process.stdout.write(output);
  },
  outputError: (str, write) => {
    write(chalk.red(str));
  },
});

// Error handler for exit overrides
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.version') {
    process.exit(0);
  }
  
  logger.error('Command error:', err.message);
  process.exit(1);
});

// Custom help text with focused examples
program.on('--help', () => {
  console.log('');
  console.log(chalk.bold.blue('━━━ 🚀 Quick Start ━━━'));
  console.log('');
  console.log(chalk.gray('  ') + chalk.blue('$') + chalk.cyan(' zelte run') + chalk.gray('                   # Run all tests'));
  console.log(chalk.gray('  ') + chalk.blue('$') + chalk.cyan(' zelte init') + chalk.gray('                   # Create new project'));
  console.log('');
  console.log(chalk.bold.blue('━━━ 📚 Resources ━━━'));
  console.log(chalk.gray('  ') + chalk.blue('https://github.com/Cintoma123/zelte'));
  console.log('');
});

// Parse and execute
(async () => {
  try {
    // Check if we should show welcome screen (no command provided)
    if (shouldShowWelcome(process.argv)) {
      await showWelcomeScreen(program);
      process.exit(0);
    }

    await program.parseAsync();
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Fatal error:', error.message);
      if (error.stack && process.env.DEBUG) {
        logger.debug(error.stack);
      }
    }
    process.exit(1);
  }
})();
