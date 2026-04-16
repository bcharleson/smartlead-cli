import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const getCommand: CommandDefinition = {
  name: 'sequences_get',
  group: 'sequences',
  subcommand: 'get',
  description: 'Fetch all sequence steps for a campaign (with variants and delays).',
  examples: [
    'smartlead sequences get 456',
    'smartlead sequences get --campaign-id 456',
  ],

  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),

  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: false }],
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID (alternative to positional arg)' },
    ],
  },

  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/sequences' },
  fieldMappings: { campaign_id: 'path' },

  handler: (input, client) => executeCommand(getCommand, input, client),
};

const saveCommand: CommandDefinition = {
  name: 'sequences_save',
  group: 'sequences',
  subcommand: 'save',
  description: `Save/replace the full sequence for a campaign. This replaces ALL existing steps.

The sequences JSON must be an array of step objects:
[{
  "seq_number": 1,
  "seq_delay_details": { "delay_in_days": 0 },
  "variant_distribution_type": "MANUAL_EQUAL",
  "variants": [{
    "subject": "Hello {{first_name}}",
    "email_body": "<p>Hi {{first_name}},</p>",
    "variant_label": "A"
  }]
}]`,
  examples: [
    'smartlead sequences save 456 --sequences \'[{"seq_number":1,"seq_delay_details":{"delay_in_days":0},"variant_distribution_type":"MANUAL_EQUAL","variants":[{"subject":"Hello","email_body":"<p>Hi</p>","variant_label":"A"}]}]\'',
  ],

  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    sequences: z.string().describe('JSON array of sequence step objects'),
  }),

  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [
      { field: 'sequences', flags: '--sequences <json>', description: 'JSON array of sequence steps' },
    ],
  },

  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/sequences' },
  fieldMappings: {},

  handler: async (input, client) => {
    const { campaign_id, sequences } = input;
    let parsed: any[];
    try {
      parsed = JSON.parse(sequences);
    } catch {
      throw new Error('Invalid --sequences JSON. Expected array of sequence step objects.');
    }
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/sequences`, { sequences: parsed });
  },
};

export const allSequencesCommands: CommandDefinition[] = [getCommand, saveCommand];
