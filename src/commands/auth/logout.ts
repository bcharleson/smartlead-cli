import { Command } from 'commander';
import { deleteConfig, getConfigPath } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLogoutCommand(program: Command): void {
  program
    .command('logout')
    .description('Remove stored Smartlead credentials')
    .action(async () => {
      const globalOpts = program.opts() as GlobalOptions;
      try {
        await deleteConfig();
        const result = { status: 'logged_out', config_path: getConfigPath() };

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log('Logged out. Config removed from ~/.smartlead-cli/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
