/**
 * Zelte CLI Welcome Screen
 * Premium terminal-first welcome experience
 * 
 * Features:
 * - ASCII logo with gradient styling
 * - Professional color palette
 * - Quick start examples
 * - Command preview
 * - Clean, minimal design
 */

import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { Command } from 'commander';

// Professional color palette for CLI
const colors = {
  primary: '#00f2ff',    // Cyan/Teal gradient start
  secondary: '#0061ff',  // Blue gradient end
  accent: '#ff0055',     // Pink accent
  text: '#ffffff',       // White text
  muted: '#8892b0',      // Muted text
  success: '#00ff88',    // Success green
  warning: '#ffd700',    // Warning yellow
};

// ASCII Logo configuration
const logoConfig: figlet.FigletOptions = {
  font: 'ANSI Shadow',   // Professional, readable font
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 80,
  whitespaceBreak: true
};

/**
 * Generate the premium Zelte logo with gradient styling
 */
function generateLogo(): string {
  const logoText = figlet.textSync('ZELTE', logoConfig);
  
  // Apply gradient to each line of the ASCII art
  const lines = logoText.split('\n');
  const gradientLines = lines.map(line => {
    if (line.trim() === '') return line;
    return gradient(colors.primary, colors.secondary)(line);
  });
  
  return gradientLines.join('\n');
}

/**
 * Generate quick start examples with syntax highlighting
 */
function generateQuickStart(): string {
  const examples = [
    {
      title: 'Run API Tests',
      command: 'zelte run ./api-tests.zelte.yaml',
      description: 'Execute your test collection'
    },
    {
      title: 'Validate Collection',
      command: 'zelte validate ./api-tests.zelte.json',
      description: 'Check collection syntax'
    },
    {
      title: 'Interactive Mode',
      command: 'zelte interactive',
      description: 'Live API testing console'
    }
  ];

  const exampleBlocks = examples.map((example, index) => {
    const title = chalk.bold.hex(colors.accent)(`▶ ${example.title}`);
    const cmd = chalk.hex(colors.success)(`$ ${example.command}`);
    const desc = chalk.hex(colors.muted)(example.description);
    
    return `${title}\n${cmd}\n${desc}\n`;
  }).join('\n');

  return boxen(exampleBlocks, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: colors.primary,
    backgroundColor: '#1a1a1a'
  });
}

/**
 * Generate command list preview
 */
function generateCommands(commands: readonly Command[]): string {
  const commandList = commands.map(cmd => {
    const name = chalk.bold.hex(colors.text)(cmd.name());
    const description = chalk.hex(colors.muted)(cmd.description());
    return `  ${name.padEnd(15)} ${description}`;
  }).join('\n');

  const header = chalk.bold.hex(colors.accent)('Available Commands:\n');
  
  return boxen(`${header}${commandList}`, {
    padding: 1,
    margin: 1,
    borderStyle: 'single',
    borderColor: colors.secondary
  });
}

/**
 * Generate footer with additional information
 */
function generateFooter(): string {
  const footerText = [
    chalk.hex(colors.muted)('⚡ Lightweight • Terminal-first • Backend-focused'),
    chalk.hex(colors.accent)('📚 Documentation: ') + chalk.hex(colors.text)('https://github.com/Cintoma123/zelte'),
    chalk.hex(colors.muted)('💡 Tip: Use ') + chalk.bold.hex(colors.success)('--help') + chalk.hex(colors.muted)(' for detailed help')
  ].join('\n');

  return boxen(footerText, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: colors.warning
  });
}

/**
 * Display the premium welcome screen
 */
export function showWelcomeScreen(program: Command): void {
  // Clear screen and add top padding
  console.clear();
  
  // Generate all components
  const logo = generateLogo();
  const quickStart = generateQuickStart();
  const commands = generateCommands(program.commands as readonly Command[]);
  const footer = generateFooter();

  // Build the complete welcome screen
  const welcomeScreen = `
${logo}

${chalk.bold.hex(colors.text)('Lightweight terminal-first API testing tool for backend engineers')}

${quickStart}
${commands}
${footer}
  `.trim();

  // Display with proper spacing
  console.log(welcomeScreen);
  console.log('\n'); // Add extra spacing at the bottom
}

/**
 * Check if this is a welcome screen request (no command provided)
 */
export function shouldShowWelcome(args: string[]): boolean {
  // Extract just the command arguments (remove node path and script path)
  const commandArgs = args.slice(2);
  
  // If no arguments provided, show welcome
  if (commandArgs.length === 0) {
    return true;
  }
  
  // Check for help and version flags - these should NOT show welcome screen
  const helpFlags = ['-h', '--help', 'help'];
  const versionFlags = ['-v', '--version', 'version'];
  
  const hasHelpFlag = commandArgs.some(arg => helpFlags.includes(arg));
  const hasVersionFlag = commandArgs.some(arg => versionFlags.includes(arg));
  
  if (hasHelpFlag || hasVersionFlag) {
    return false;
  }
  
  // Check if only global options are provided (no actual command)
  const hasCommand = commandArgs.some(arg => 
    !arg.startsWith('-') && 
    arg !== 'zelte' && 
    arg !== 'node' && 
    arg !== 'zelte.js'
  );
  
  return !hasCommand;
}
