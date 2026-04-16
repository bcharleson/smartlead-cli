import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const getByEmailCommand: CommandDefinition = {
  name: 'leads_get_by_email',
  group: 'leads',
  subcommand: 'get-by-email',
  description: 'Fetch a lead by email address across all campaigns.',
  examples: ['smartlead leads get-by-email --email "john@example.com"'],
  inputSchema: z.object({
    email: z.string().email().describe('Lead email address'),
  }),
  cliMappings: {
    options: [{ field: 'email', flags: '--email <email>', description: 'Lead email address' }],
  },
  endpoint: { method: 'GET', path: '/leads/' },
  fieldMappings: { email: 'query' },
  handler: (input, client) => executeCommand(getByEmailCommand, input, client),
};

const fetchCategoriesCommand: CommandDefinition = {
  name: 'leads_fetch_categories',
  group: 'leads',
  subcommand: 'fetch-categories',
  description: 'Get all available lead categories (global + custom) with sentiment classification.',
  examples: ['smartlead leads fetch-categories'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
  }),
  cliMappings: {
    options: [{ field: 'client_id', flags: '--client-id <id>', description: 'Filter by client ID' }],
  },
  endpoint: { method: 'GET', path: '/leads/fetch-categories' },
  fieldMappings: { client_id: 'query' },
  handler: (input, client) => executeCommand(fetchCategoriesCommand, input, client),
};

const listCampaignLeadsCommand: CommandDefinition = {
  name: 'leads_list_campaign',
  group: 'leads',
  subcommand: 'list-campaign',
  description: 'List all leads in a campaign with pagination.',
  examples: ['smartlead leads list-campaign --campaign-id 456', 'smartlead leads list-campaign --campaign-id 456 --offset 100 --limit 50'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    offset: z.coerce.number().optional().describe('Pagination offset (default: 0)'),
    limit: z.coerce.number().optional().describe('Results per page (max 100, default: 100)'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page (max 100)' },
    ],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/leads' },
  fieldMappings: { campaign_id: 'path', offset: 'query', limit: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(listCampaignLeadsCommand, input, client),
};

const addLeadsCommand: CommandDefinition = {
  name: 'leads_add_to_campaign',
  group: 'leads',
  subcommand: 'add-to-campaign',
  description: `Add one or more leads to a campaign.

Lead object fields: email (required), first_name, last_name, company_name, phone_number, website, location, linkedin_profile, custom_fields (object)`,
  examples: [
    'smartlead leads add-to-campaign --campaign-id 456 --lead-list \'[{"email":"john@acme.com","first_name":"John","company_name":"Acme"}]\'',
  ],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_list: z.string().describe('JSON array of lead objects'),
    allow_duplicate: z.boolean().optional().describe('Allow duplicate email addresses'),
    ignore_global_block_list: z.boolean().optional().describe('Skip global block list check'),
    ignore_unsubscribe_list: z.boolean().optional().describe('Skip unsubscribe list check'),
    ignore_community_bounce_list: z.boolean().optional().describe('Skip community bounce list'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_list', flags: '--lead-list <json>', description: 'JSON array of lead objects' },
      { field: 'allow_duplicate', flags: '--allow-duplicate', description: 'Allow duplicate leads' },
      { field: 'ignore_global_block_list', flags: '--ignore-block-list', description: 'Skip global block list' },
      { field: 'ignore_unsubscribe_list', flags: '--ignore-unsubscribe', description: 'Skip unsubscribe list' },
      { field: 'ignore_community_bounce_list', flags: '--ignore-bounce-list', description: 'Skip bounce list' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, lead_list, ...options } = input;
    let leads: any[];
    try { leads = JSON.parse(lead_list); }
    catch { throw new Error('Invalid --lead-list JSON. Expected array of lead objects.'); }
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/leads`, {
      lead_list: leads,
      ...options,
    });
  },
};

const updateLeadCommand: CommandDefinition = {
  name: 'leads_update',
  group: 'leads',
  subcommand: 'update',
  description: 'Update a lead in a campaign.',
  examples: ['smartlead leads update --campaign-id 456 --lead-id 789 --first-name "Jane"'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
    first_name: z.string().optional().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    company_name: z.string().optional().describe('Company name'),
    phone_number: z.string().optional().describe('Phone number'),
    website: z.string().optional().describe('Website URL'),
    location: z.string().optional().describe('Location'),
    linkedin_profile: z.string().optional().describe('LinkedIn profile URL'),
    custom_fields: z.string().optional().describe('JSON object of custom field key-value pairs'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'first_name', flags: '--first-name <name>', description: 'First name' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name' },
      { field: 'phone_number', flags: '--phone-number <phone>', description: 'Phone number' },
      { field: 'website', flags: '--website <url>', description: 'Website URL' },
      { field: 'location', flags: '--location <loc>', description: 'Location' },
      { field: 'linkedin_profile', flags: '--linkedin <url>', description: 'LinkedIn profile URL' },
      { field: 'custom_fields', flags: '--custom-fields <json>', description: 'JSON custom fields' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads/{lead_id}' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, lead_id, custom_fields, ...rest } = input;
    const body: Record<string, any> = { ...rest };
    if (custom_fields) {
      try { body.custom_fields = JSON.parse(custom_fields); }
      catch { throw new Error('Invalid --custom-fields JSON. Expected object like: {"key":"value"}'); }
    }
    return client.post(
      `/campaigns/${encodeURIComponent(campaign_id)}/leads/${encodeURIComponent(lead_id)}`,
      body,
    );
  },
};

const pauseLeadCommand: CommandDefinition = {
  name: 'leads_pause',
  group: 'leads',
  subcommand: 'pause',
  description: 'Pause email sending to a specific lead in a campaign.',
  examples: ['smartlead leads pause --campaign-id 456 --lead-id 789'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads/{lead_id}/pause' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(pauseLeadCommand, input, client),
};

const resumeLeadCommand: CommandDefinition = {
  name: 'leads_resume',
  group: 'leads',
  subcommand: 'resume',
  description: 'Resume email sending to a paused lead in a campaign.',
  examples: ['smartlead leads resume --campaign-id 456 --lead-id 789'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads/{lead_id}/resume' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(resumeLeadCommand, input, client),
};

const unsubscribeFromCampaignCommand: CommandDefinition = {
  name: 'leads_unsubscribe_campaign',
  group: 'leads',
  subcommand: 'unsubscribe-campaign',
  description: 'Unsubscribe a lead from a specific campaign.',
  examples: ['smartlead leads unsubscribe-campaign --campaign-id 456 --lead-id 789'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads/{lead_id}/unsubscribe' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(unsubscribeFromCampaignCommand, input, client),
};

const unsubscribeGlobalCommand: CommandDefinition = {
  name: 'leads_unsubscribe_global',
  group: 'leads',
  subcommand: 'unsubscribe-global',
  description: 'Globally unsubscribe a lead from all campaigns.',
  examples: ['smartlead leads unsubscribe-global --lead-id 789'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [{ field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' }],
  },
  endpoint: { method: 'POST', path: '/leads/{lead_id}/unsubscribe' },
  fieldMappings: { lead_id: 'path' },
  handler: (input, client) => executeCommand(unsubscribeGlobalCommand, input, client),
};

const deleteFromCampaignCommand: CommandDefinition = {
  name: 'leads_delete',
  group: 'leads',
  subcommand: 'delete',
  description: 'Delete a lead from a campaign.',
  examples: ['smartlead leads delete --campaign-id 456 --lead-id 789'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
    ],
  },
  endpoint: { method: 'DELETE', path: '/campaigns/{campaign_id}/leads/{lead_id}' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(deleteFromCampaignCommand, input, client),
};

const deleteGloballyCommand: CommandDefinition = {
  name: 'leads_delete_globally',
  group: 'leads',
  subcommand: 'delete-globally',
  description: 'Delete a lead globally. If not in other campaigns, permanently removed from the system.',
  examples: ['smartlead leads delete-globally --lead-id 789'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [{ field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' }],
  },
  endpoint: { method: 'DELETE', path: '/leads/{lead_id}' },
  fieldMappings: { lead_id: 'path' },
  handler: (input, client) => executeCommand(deleteGloballyCommand, input, client),
};

const getLeadCampaignsCommand: CommandDefinition = {
  name: 'leads_get_campaigns',
  group: 'leads',
  subcommand: 'get-campaigns',
  description: 'Fetch all campaigns a lead belongs to.',
  examples: ['smartlead leads get-campaigns --lead-id 789'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [{ field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' }],
  },
  endpoint: { method: 'GET', path: '/leads/{lead_id}/campaigns' },
  fieldMappings: { lead_id: 'path' },
  handler: (input, client) => executeCommand(getLeadCampaignsCommand, input, client),
};

const addDomainBlockCommand: CommandDefinition = {
  name: 'leads_add_domain_block',
  group: 'leads',
  subcommand: 'add-domain-block',
  description: 'Add a domain to the global block list.',
  examples: ['smartlead leads add-domain-block --domain "competitor.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to block (e.g., competitor.com)'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'domain', flags: '--domain <domain>', description: 'Domain to block' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/leads/add-domain-block-list' },
  fieldMappings: { domain: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(addDomainBlockCommand, input, client),
};

const exportLeadsCommand: CommandDefinition = {
  name: 'leads_export',
  group: 'leads',
  subcommand: 'export',
  description: 'Export leads from a campaign as CSV. Output is raw CSV (pipe-friendly).',
  examples: [
    'smartlead leads export --campaign-id 456',
    'smartlead leads export --campaign-id 456 > leads.csv',
  ],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    options: [{ field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' }],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/leads-export' },
  fieldMappings: { campaign_id: 'path' },
  handler: async (input, client) => {
    const campaignId = Number(input.campaign_id);
    const result = await client.get<any>(
      `/campaigns/${encodeURIComponent(campaignId)}/leads-export`,
    );
    // Smartlead returns raw CSV. Our client wraps plain-text responses as
    // {ok, message} — unwrap it and write CSV directly to stdout so the
    // output is pipe-friendly (`> leads.csv` works).
    const csv =
      typeof result === 'string'
        ? result
        : result?.message && typeof result.message === 'string'
          ? result.message
          : JSON.stringify(result);
    process.stdout.write(csv.endsWith('\n') ? csv : csv + '\n');
    // Return undefined so output() does not double-print.
    return undefined;
  },
};

export const allLeadsCommands: CommandDefinition[] = [
  getByEmailCommand,
  fetchCategoriesCommand,
  listCampaignLeadsCommand,
  addLeadsCommand,
  updateLeadCommand,
  pauseLeadCommand,
  resumeLeadCommand,
  unsubscribeFromCampaignCommand,
  unsubscribeGlobalCommand,
  deleteFromCampaignCommand,
  deleteGloballyCommand,
  getLeadCampaignsCommand,
  addDomainBlockCommand,
  exportLeadsCommand,
];
