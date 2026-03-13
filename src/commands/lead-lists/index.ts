import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const createLeadListCommand: CommandDefinition = {
  name: 'lead_lists_create',
  group: 'lead-lists',
  subcommand: 'create',
  description: 'Create a new lead list.',
  examples: ['smartlead lead-lists create --name "Q1 Prospects" --client-id 12'],
  inputSchema: z.object({
    name: z.string().describe('Lead list name'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'name', flags: '--name <name>', description: 'Lead list name' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/lead-list/' },
  fieldMappings: { name: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(createLeadListCommand, input, client),
};

const listLeadListsCommand: CommandDefinition = {
  name: 'lead_lists_list',
  group: 'lead-lists',
  subcommand: 'list',
  description: 'List all lead lists in the account.',
  examples: ['smartlead lead-lists list', 'smartlead lead-lists list --offset 0 --limit 25'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'GET', path: '/lead-list/' },
  fieldMappings: { offset: 'query', limit: 'query', client_id: 'query' },
  handler: (input, client) => executeCommand(listLeadListsCommand, input, client),
};

const getLeadListCommand: CommandDefinition = {
  name: 'lead_lists_get',
  group: 'lead-lists',
  subcommand: 'get',
  description: 'Get a specific lead list by ID.',
  examples: ['smartlead lead-lists get --list-id 99'],
  inputSchema: z.object({
    id: z.coerce.number().describe('Lead list ID'),
  }),
  cliMappings: {
    options: [{ field: 'id', flags: '--list-id <id>', description: 'Lead list ID' }],
  },
  endpoint: { method: 'GET', path: '/lead-list/{id}' },
  fieldMappings: { id: 'path' },
  handler: (input, client) => executeCommand(getLeadListCommand, input, client),
};

const updateLeadListCommand: CommandDefinition = {
  name: 'lead_lists_update',
  group: 'lead-lists',
  subcommand: 'update',
  description: 'Update a lead list name or settings.',
  examples: ['smartlead lead-lists update --list-id 99 --name "Q2 Prospects"'],
  inputSchema: z.object({
    id: z.coerce.number().describe('Lead list ID'),
    name: z.string().optional().describe('New lead list name'),
  }),
  cliMappings: {
    options: [
      { field: 'id', flags: '--list-id <id>', description: 'Lead list ID' },
      { field: 'name', flags: '--name <name>', description: 'New name' },
    ],
  },
  endpoint: { method: 'PUT', path: '/lead-list/{id}' },
  fieldMappings: { id: 'path', name: 'body' },
  handler: (input, client) => executeCommand(updateLeadListCommand, input, client),
};

const deleteLeadListCommand: CommandDefinition = {
  name: 'lead_lists_delete',
  group: 'lead-lists',
  subcommand: 'delete',
  description: 'Delete a lead list.',
  examples: ['smartlead lead-lists delete --list-id 99'],
  inputSchema: z.object({
    id: z.coerce.number().describe('Lead list ID'),
  }),
  cliMappings: {
    options: [{ field: 'id', flags: '--list-id <id>', description: 'Lead list ID' }],
  },
  endpoint: { method: 'DELETE', path: '/lead-list/{id}' },
  fieldMappings: { id: 'path' },
  handler: (input, client) => executeCommand(deleteLeadListCommand, input, client),
};

const importLeadsToListCommand: CommandDefinition = {
  name: 'lead_lists_import',
  group: 'lead-lists',
  subcommand: 'import',
  description: 'Import leads into a lead list from a JSON array.',
  examples: ['smartlead lead-lists import --list-id 99 --leads \'[{"email":"jane@acme.com","first_name":"Jane"}]\''],
  inputSchema: z.object({
    id: z.coerce.number().describe('Lead list ID'),
    leads: z.string().describe('JSON array of lead objects (email required per lead)'),
    allow_duplicate: z.boolean().optional().describe('Allow duplicate emails'),
    ignore_global_block_list: z.boolean().optional().describe('Skip global block list'),
    ignore_unsubscribe_list: z.boolean().optional().describe('Skip unsubscribe list'),
    ignore_community_bounce_list: z.boolean().optional().describe('Skip community bounce list'),
  }),
  cliMappings: {
    options: [
      { field: 'id', flags: '--list-id <id>', description: 'Lead list ID' },
      { field: 'leads', flags: '--leads <json>', description: 'JSON array of lead objects' },
      { field: 'allow_duplicate', flags: '--allow-duplicate', description: 'Allow duplicates' },
      { field: 'ignore_global_block_list', flags: '--ignore-block-list', description: 'Skip block list' },
      { field: 'ignore_unsubscribe_list', flags: '--ignore-unsubscribe', description: 'Skip unsubscribe list' },
      { field: 'ignore_community_bounce_list', flags: '--ignore-bounce-list', description: 'Skip bounce list' },
    ],
  },
  endpoint: { method: 'POST', path: '/lead-list/{id}/import' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { id, leads, ...options } = input;
    let leadsArr: any[];
    try { leadsArr = JSON.parse(leads); }
    catch { throw new Error('Invalid --leads JSON. Expected array of lead objects.'); }
    return client.post(`/lead-list/${encodeURIComponent(id)}/import`, {
      leads: leadsArr,
      ...options,
    });
  },
};

const assignTagsToListCommand: CommandDefinition = {
  name: 'lead_lists_assign_tags',
  group: 'lead-lists',
  subcommand: 'assign-tags',
  description: 'Assign tags to a lead list.',
  examples: ['smartlead lead-lists assign-tags --list-id 99 --tag-ids \'[1,2]\''],
  inputSchema: z.object({
    id: z.coerce.number().describe('Lead list ID'),
    tag_ids: z.string().describe('JSON array of tag IDs'),
  }),
  cliMappings: {
    options: [
      { field: 'id', flags: '--list-id <id>', description: 'Lead list ID' },
      { field: 'tag_ids', flags: '--tag-ids <json>', description: 'JSON array of tag IDs' },
    ],
  },
  endpoint: { method: 'POST', path: '/lead-list/assign-tags' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { id, tag_ids } = input;
    let tagIds: number[];
    try { tagIds = JSON.parse(tag_ids); }
    catch { throw new Error('Invalid --tag-ids JSON. Expected array of numbers.'); }
    return client.post('/lead-list/assign-tags', { id, tag_ids: tagIds });
  },
};

const pushLeadsBetweenListsCommand: CommandDefinition = {
  name: 'lead_lists_push_between',
  group: 'lead-lists',
  subcommand: 'push-between',
  description: 'Move or copy leads from one list to another.',
  examples: ['smartlead lead-lists push-between --from-list-id 10 --to-list-id 20 --lead-ids \'[101,102]\''],
  inputSchema: z.object({
    from_list_id: z.coerce.number().describe('Source lead list ID'),
    to_list_id: z.coerce.number().describe('Destination lead list ID'),
    lead_ids: z.string().describe('JSON array of lead IDs to move'),
    move: z.boolean().optional().describe('Move (remove from source) instead of copy'),
  }),
  cliMappings: {
    options: [
      { field: 'from_list_id', flags: '--from-list-id <id>', description: 'Source list ID' },
      { field: 'to_list_id', flags: '--to-list-id <id>', description: 'Destination list ID' },
      { field: 'lead_ids', flags: '--lead-ids <json>', description: 'JSON array of lead IDs' },
      { field: 'move', flags: '--move', description: 'Move instead of copy' },
    ],
  },
  endpoint: { method: 'POST', path: '/leads/leads/push-between-lists' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { lead_ids, ...rest } = input;
    let ids: number[];
    try { ids = JSON.parse(lead_ids); }
    catch { throw new Error('Invalid --lead-ids JSON. Expected array of numbers.'); }
    return client.post('/leads/leads/push-between-lists', { ...rest, lead_ids: ids });
  },
};

const pushListToCampaignCommand: CommandDefinition = {
  name: 'lead_lists_push_to_campaign',
  group: 'lead-lists',
  subcommand: 'push-to-campaign',
  description: 'Push an entire lead list into a campaign.',
  examples: ['smartlead lead-lists push-to-campaign --list-id 99 --campaign-id 456'],
  inputSchema: z.object({
    id: z.coerce.number().describe('Lead list ID'),
    campaign_id: z.coerce.number().describe('Target campaign ID'),
    allow_duplicate: z.boolean().optional().describe('Allow duplicate leads'),
    ignore_global_block_list: z.boolean().optional().describe('Skip global block list'),
    ignore_unsubscribe_list: z.boolean().optional().describe('Skip unsubscribe list'),
    ignore_community_bounce_list: z.boolean().optional().describe('Skip community bounce list'),
  }),
  cliMappings: {
    options: [
      { field: 'id', flags: '--list-id <id>', description: 'Lead list ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'allow_duplicate', flags: '--allow-duplicate', description: 'Allow duplicates' },
      { field: 'ignore_global_block_list', flags: '--ignore-block-list', description: 'Skip block list' },
      { field: 'ignore_unsubscribe_list', flags: '--ignore-unsubscribe', description: 'Skip unsubscribe' },
      { field: 'ignore_community_bounce_list', flags: '--ignore-bounce-list', description: 'Skip bounce list' },
    ],
  },
  endpoint: { method: 'POST', path: '/leads/push-to-campaign' },
  fieldMappings: { id: 'body', campaign_id: 'body', allow_duplicate: 'body', ignore_global_block_list: 'body', ignore_unsubscribe_list: 'body', ignore_community_bounce_list: 'body' },
  handler: (input, client) => executeCommand(pushListToCampaignCommand, input, client),
};

export const allLeadListsCommands: CommandDefinition[] = [
  createLeadListCommand,
  listLeadListsCommand,
  getLeadListCommand,
  updateLeadListCommand,
  deleteLeadListCommand,
  importLeadsToListCommand,
  assignTagsToListCommand,
  pushLeadsBetweenListsCommand,
  pushListToCampaignCommand,
];
