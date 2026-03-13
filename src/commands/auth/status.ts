import { Command } from 'commander';
import { loadConfig, getConfigPath } from '../../core/config.js';
import { SmartleadClient } from '../../core/client.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show current authentication status')
    .action(async () => {
      const globalOpts = program.opts() as GlobalOptions;
      try {
        const config = await loadConfig();
        const envKey = process.env.SMARTLEAD_API_KEY;
        const key = config?.api_key || envKey;

        if (!key) {
          const result = {
            authenticated: false,
            source: 'none',
            config_path: getConfigPath(),
          };
          if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
            console.log('Not authenticated. Run: smartlead login');
          } else {
            output(result, globalOpts);
          }
          return;
        }

        const source = config?.api_key ? 'config' : 'env';
        const client = new SmartleadClient({ apiKey: key });

        let valid = false;
        try {
          await client.get('/campaigns/');
          valid = true;
        } catch {
          valid = false;
        }

        const result = {
          authenticated: valid,
          source,
          config_path: getConfigPath(),
        };

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log(`Authenticated: ${valid ? 'yes' : 'no (invalid key)'} (via ${source})`);
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
