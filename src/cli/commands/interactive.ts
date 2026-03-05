/**
 * Interactive REPL Mode
 * Interactive command-line interface for exploring and testing APIs
 */

import { Command } from 'commander';
import readline from 'readline';
import chalk from 'chalk';
import { logger } from '../../utils/logger';
import { HttpClient } from '../../core/http/client';
import { RequestBuilder } from '../../core/http/request';
import { AssertionEngine } from '../../core/assertions/engine';
import { VariableResolver } from '../../core/variables/resolver';
import { ConfigLoader } from '../../config/loader';

interface REPLState {
  variables: Record<string, any>;
  lastResponse?: any;
  baseUrl?: string;
  authToken?: string;
  currentEnv?: string;
}

class InteractiveREPL {
  private rl: readline.Interface;
  private state: REPLState;
  private httpClient: HttpClient;
  private assertionEngine: AssertionEngine;
  private variableResolver: VariableResolver;
  private configLoader: ConfigLoader;
  private running: boolean = true;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.state = {
      variables: {},
      baseUrl: 'http://localhost:3000',
    };

    this.httpClient = new HttpClient(30000);
    this.assertionEngine = new AssertionEngine();
    this.variableResolver = new VariableResolver(this.state.variables);
    this.configLoader = new ConfigLoader();
  }

  /**
   * Start the interactive REPL
   */
  async start(): Promise<void> {
    this.printWelcome();

    // Main REPL loop
    await this.loop();

    this.rl.close();
  }

  /**
   * Print welcome message
   */
  private printWelcome(): void {
    console.log(chalk.cyan('\n🚀 Zelte Interactive REPL'));
    console.log('─'.repeat(50));
    console.log(chalk.gray('Type "help" for available commands\n'));
  }

  /**
   * Main REPL loop
   */
  private async loop(): Promise<void> {
    const prompt = (): Promise<void> => {
      return new Promise((resolve) => {
        this.rl.question(chalk.cyan('zelte> '), async (input) => {
          const trimmed = input.trim();

          if (!trimmed) {
            resolve(prompt());
            return;
          }

          const [command, ...args] = trimmed.split(/\s+/);

          await this.executeCommand(command, args);

          if (this.running) {
            resolve(prompt());
          }
        });
      });
    };

    await prompt();
  }

  /**
   * Execute a command
   */
  private async executeCommand(command: string, args: string[]): Promise<void> {
    switch (command.toLowerCase()) {
      case 'help':
        this.printHelp();
        break;

      case 'get':
      case 'post':
      case 'put':
      case 'delete':
      case 'patch':
        await this.makeRequest(command.toUpperCase(), args);
        break;

      case 'set':
        this.setVariable(args);
        break;

      case 'vars':
        this.printVariables();
        break;

      case 'last':
        this.printLastResponse();
        break;

      case 'assert':
        this.assertLastResponse(args);
        break;

      case 'config':
        this.showConfig();
        break;

      case 'baseurl':
        this.setBaseUrl(args[0]);
        break;

      case 'auth':
        this.setAuth(args);
        break;

      case 'load':
        await this.loadCollection(args[0]);
        break;

      case 'clear':
        this.clearState();
        break;

      case 'exit':
      case 'quit':
        this.running = false;
        console.log(chalk.yellow('\nGoodbye!'));
        break;

      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.gray('Type "help" for available commands'));
    }
  }

  /**
   * Make HTTP request
   */
  private async makeRequest(method: string, args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Usage: ' + method.toLowerCase() + ' <path> [data]'));
      return;
    }

    try {
      const path = args[0];
      const url = this.state.baseUrl + (path.startsWith('/') ? path : '/' + path);
      const body = args[1] ? JSON.parse(args[1]) : undefined;

      const headers: Record<string, string> = { 'User-Agent': 'Zelte-REPL' };
      if (this.state.authToken) {
        headers['Authorization'] = `Bearer ${this.state.authToken}`;
      }

      const config = {
        method: method as any,
        url,
        headers,
        data: body,
        validateStatus: () => true,
      };

      console.log(chalk.gray(`${method} ${url}`));
      const response = await this.httpClient.execute(config);

      this.state.lastResponse = response.data || JSON.parse(response.body);

      console.log(chalk.green(`✓ ${response.statusCode}`));
      if (this.state.lastResponse) {
        console.log(
          chalk.gray(JSON.stringify(this.state.lastResponse, null, 2).split('\n').join('\n  '))
        );
      }
    } catch (error) {
      console.log(
        chalk.red('Error: ' + (error instanceof Error ? error.message : String(error)))
      );
    }
  }

  /**
   * Set a variable
   */
  private setVariable(args: string[]): void {
    if (args.length < 2) {
      console.log(chalk.red('Usage: set <name> <value>'));
      return;
    }

    const name = args[0];
    const value = args.slice(1).join(' ');

    try {
      // Try to parse as JSON first
      this.state.variables[name] = JSON.parse(value);
    } catch {
      // Otherwise treat as string
      this.state.variables[name] = value;
    }

    this.variableResolver = new VariableResolver(this.state.variables);
    console.log(chalk.green(`✓ Set ${name} = ${JSON.stringify(this.state.variables[name])}`));
  }

  /**
   * Print all variables
   */
  private printVariables(): void {
    if (Object.keys(this.state.variables).length === 0) {
      console.log(chalk.gray('No variables set'));
      return;
    }

    console.log(chalk.cyan('\nVariables:'));
    for (const [key, value] of Object.entries(this.state.variables)) {
      console.log(`  ${key} = ${JSON.stringify(value)}`);
    }
    console.log();
  }

  /**
   * Print last response
   */
  private printLastResponse(): void {
    if (!this.state.lastResponse) {
      console.log(chalk.gray('No response yet'));
      return;
    }

    console.log(chalk.cyan('\nLast Response:'));
    console.log(JSON.stringify(this.state.lastResponse, null, 2));
    console.log();
  }

  /**
   * Assert on last response
   */
  private assertLastResponse(args: string[]): void {
    if (!this.state.lastResponse) {
      console.log(chalk.red('No response to assert on'));
      return;
    }

    if (args.length === 0) {
      console.log(chalk.red('Usage: assert <assertion>'));
      return;
    }

    const assertion = args.join(' ');

    try {
      const results = this.assertionEngine.evaluateAssertions([assertion], {
        statusCode: 200,
        headers: {},
        body: JSON.stringify(this.state.lastResponse),
        data: this.state.lastResponse,
        duration: 0,
        timestamp: Date.now(),
      });

      for (const result of results) {
        if (result.passed) {
          console.log(chalk.green(`✓ ${result.name}`));
        } else {
          console.log(chalk.red(`✗ ${result.name}: ${result.error}`));
        }
      }
    } catch (error) {
      console.log(
        chalk.red('Error: ' + (error instanceof Error ? error.message : String(error)))
      );
    }
  }

  /**
   * Show current configuration
   */
  private showConfig(): void {
    console.log(chalk.cyan('\nConfiguration:'));
    console.log(`  Base URL:      ${this.state.baseUrl}`);
    console.log(`  Auth Token:    ${this.state.authToken ? '***' : '<not set>'}`);
    console.log(`  Environment:   ${this.state.currentEnv || 'default'}`);
    console.log(`  Variables:     ${Object.keys(this.state.variables).length}`);
    console.log();
  }

  /**
   * Set base URL
   */
  private setBaseUrl(url?: string): void {
    if (!url) {
      console.log(`Base URL: ${this.state.baseUrl}`);
      return;
    }

    this.state.baseUrl = url;
    console.log(chalk.green(`✓ Base URL set to ${url}`));
  }

  /**
   * Set authentication
   */
  private setAuth(args: string[]): void {
    if (args.length === 0) {
      console.log(`Auth: ${this.state.authToken ? 'Bearer ***' : '<not set>'}`);
      return;
    }

    const token = args[0];
    this.state.authToken = token;
    console.log(chalk.green('✓ Auth token set'));
  }

  /**
   * Load a collection file
   */
  private async loadCollection(filePath?: string): Promise<void> {
    if (!filePath) {
      console.log(chalk.red('Usage: load <path>'));
      return;
    }

    try {
      const collection = this.configLoader.loadCollection(filePath);
      this.state.variables = { ...this.state.variables, ...collection.variables };
      this.variableResolver = new VariableResolver(this.state.variables);
      console.log(chalk.green(`✓ Loaded ${collection.name}`));
      console.log(`  Tests: ${(collection.tests || []).length}`);
      console.log(`  GraphQL: ${(collection.graphql || []).length}`);
    } catch (error) {
      console.log(
        chalk.red('Error: ' + (error instanceof Error ? error.message : String(error)))
      );
    }
  }

  /**
   * Clear state
   */
  private clearState(): void {
    this.state.variables = {};
    this.state.lastResponse = undefined;
    this.variableResolver = new VariableResolver(this.state.variables);
    console.log(chalk.green('✓ State cleared'));
  }

  /**
   * Print help
   */
  private printHelp(): void {
    const commands = [
      ['get <path>', 'Make GET request'],
      ['post <path> [data]', 'Make POST request with JSON body'],
      ['put <path> [data]', 'Make PUT request'],
      ['delete <path>', 'Make DELETE request'],
      ['patch <path> [data]', 'Make PATCH request'],
      ['set <name> <value>', 'Set a variable'],
      ['vars', 'List all variables'],
      ['last', 'Show last response'],
      ['assert <assertion>', 'Assert on last response'],
      ['config', 'Show configuration'],
      ['baseurl [url]', 'Set/show base URL'],
      ['auth [token]', 'Set/show auth token'],
      ['load <path>', 'Load collection file'],
      ['clear', 'Clear all state'],
      ['help', 'Show this help'],
      ['exit / quit', 'Exit REPL'],
    ];

    console.log(chalk.cyan('\nAvailable Commands:'));
    for (const [cmd, desc] of commands) {
      console.log(`  ${chalk.green(cmd.padEnd(30))} ${desc}`);
    }
    console.log();
  }
}

export const interactiveCommand = new Command('interactive')
  .alias('i')
  .description('Start interactive REPL for API exploration and testing')
  .action(async () => {
    try {
      logger.setVerbose(false);
      const repl = new InteractiveREPL();
      await repl.start();
    } catch (error) {
      logger.error(
        'Failed to start interactive mode:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
