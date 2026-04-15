import { Command } from 'commander';
import { registerAllCommands } from './commands/index.js';
import { VERSION } from './core/version.js';

const program = new Command();

program
  .name('smartlead')
  .description('CLI and MCP server for the Smartlead.ai API — campaigns, leads, email accounts, sequences, analytics, and more')
  .version(VERSION)
  .option('--api-key <key>', 'API key (overrides SMARTLEAD_API_KEY env var and stored config)')
  .option('--output <format>', 'Output format: json (default) or pretty', 'json')
  .option('--pretty', 'Shorthand for --output pretty')
  .option('--quiet', 'Suppress output, exit codes only')
  .option('--fields <fields>', 'Comma-separated list of fields to include in output');

registerAllCommands(program);

program.parse();
