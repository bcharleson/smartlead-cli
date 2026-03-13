import { Command } from 'commander';
import { SmartleadClient } from '../../core/client.js';
import { saveConfig } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with your Smartlead API key')
    .option('--api-key <key>', 'API key (skips interactive prompt)')
    .action(async (opts) => {
      const globalOpts = program.opts() as GlobalOptions;

      try {
        let apiKey = opts.apiKey || process.env.SMARTLEAD_API_KEY;

        if (!apiKey) {
          if (!process.stdin.isTTY) {
            outputError(
              new Error('No API key provided. Use --api-key or set SMARTLEAD_API_KEY'),
              globalOpts,
            );
            return;
          }

          console.log('Get your API key from: Smartlead Settings > API Key\n');

          const { password } = await import('@inquirer/prompts');
          apiKey = await password({
            message: 'Enter your Smartlead API key:',
            mask: '*',
          });
        }

        if (!apiKey) {
          outputError(new Error('No API key provided'), globalOpts);
          return;
        }

        const client = new SmartleadClient({ apiKey });

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log('Validating API key...');
        }

        // Validate by listing campaigns (lightweight call)
        let valid = false;
        try {
          await client.get('/campaigns/');
          valid = true;
        } catch {
          valid = false;
        }

        if (!valid) {
          outputError(new Error('Invalid API key — could not authenticate with Smartlead'), globalOpts);
          return;
        }

        await saveConfig({ api_key: apiKey });

        const result = {
          status: 'authenticated',
          config_path: '~/.smartlead-cli/config.json',
        };

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log('\nAuthenticated successfully!');
          console.log('Config saved to ~/.smartlead-cli/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
