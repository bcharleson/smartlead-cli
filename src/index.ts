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
  .option('--fields <fields>', 'Comma-separated list of fields to include in output')
  .addHelpText('after', `
End-to-end outreach workflow:
  1. Create campaign    smartlead campaigns create --name "Q1" --client-id 31204
  2. Save sequence      smartlead sequences save <id> --sequences '[{...}]'
  3. Set schedule       smartlead campaigns schedule <id> --timezone "America/New_York" --days "[1,2,3,4,5]" --start-hour "09:00" --end-hour "18:00" --max-leads-per-day 50
  4. Assign sender      smartlead email-accounts add-to-campaign --campaign-id <id> --account-id <eid>
  5. Add leads          smartlead leads add-to-campaign --campaign-id <id> --lead-list '[{"email":"j@co.com","first_name":"J","custom_fields":{"Title":"CTO"}}]'
  6. Start campaign     smartlead campaigns update-status <id> --status START
`);

registerAllCommands(program);

program.parse();
