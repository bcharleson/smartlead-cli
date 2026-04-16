import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// ─── Core CRUD ───────────────────────────────────────────────────────────────

const listCommand: CommandDefinition = {
  name: 'email_accounts_list',
  group: 'email-accounts',
  subcommand: 'list',
  description: 'List all email accounts in your Smartlead account.',
  examples: ['smartlead email-accounts list', 'smartlead email-accounts list --offset 0 --limit 50'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset (default: 0)'),
    limit: z.coerce.number().optional().describe('Results per page (max 100, default: 100)'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page (max 100)' },
    ],
  },
  endpoint: { method: 'GET', path: '/email-accounts/' },
  fieldMappings: { offset: 'query', limit: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(listCommand, input, client),
};

const getCommand: CommandDefinition = {
  name: 'email_accounts_get',
  group: 'email-accounts',
  subcommand: 'get',
  description: 'Get an email account by ID.',
  examples: ['smartlead email-accounts get 789'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: false }],
    options: [{ field: 'email_account_id', flags: '--account-id <id>', description: 'Email account ID' }],
  },
  endpoint: { method: 'GET', path: '/email-accounts/{email_account_id}/' },
  fieldMappings: { email_account_id: 'path' },
  handler: (input, client) => executeCommand(getCommand, input, client),
};

const createCommand: CommandDefinition = {
  name: 'email_accounts_create',
  group: 'email-accounts',
  subcommand: 'create',
  description: 'Create (add) a new email sending account with SMTP/IMAP credentials.',
  examples: [
    'smartlead email-accounts create --from-name "John Smith" --from-email "john@domain.com" --username "john@domain.com" --password "pass" --smtp-host "smtp.gmail.com" --smtp-port 587 --imap-host "imap.gmail.com" --imap-port 993',
  ],
  inputSchema: z.object({
    from_name: z.string().describe('Sender display name'),
    from_email: z.string().email().describe('Sender email address'),
    username: z.string().describe('SMTP/IMAP username'),
    password: z.string().describe('SMTP/IMAP password or app password'),
    smtp_host: z.string().describe('SMTP server hostname'),
    smtp_port: z.coerce.number().describe('SMTP port (e.g., 587, 465, 25)'),
    smtp_port_type: z.enum(['TLS', 'SSL', 'STARTTLS']).optional().describe('SMTP port type'),
    imap_host: z.string().describe('IMAP server hostname'),
    imap_port: z.coerce.number().describe('IMAP port (e.g., 993, 143)'),
    max_email_per_day: z.coerce.number().optional().describe('Max emails per day limit'),
    bcc: z.string().optional().describe('BCC email address for all outgoing emails'),
    signature: z.string().optional().describe('Email signature HTML'),
  }),
  cliMappings: {
    options: [
      { field: 'from_name', flags: '--from-name <name>', description: 'Sender display name' },
      { field: 'from_email', flags: '--from-email <email>', description: 'Sender email address' },
      { field: 'username', flags: '--username <user>', description: 'SMTP/IMAP username' },
      { field: 'password', flags: '--password <pass>', description: 'SMTP/IMAP password' },
      { field: 'smtp_host', flags: '--smtp-host <host>', description: 'SMTP server hostname' },
      { field: 'smtp_port', flags: '--smtp-port <port>', description: 'SMTP port' },
      { field: 'smtp_port_type', flags: '--smtp-port-type <type>', description: 'SMTP type: TLS, SSL, STARTTLS' },
      { field: 'imap_host', flags: '--imap-host <host>', description: 'IMAP server hostname' },
      { field: 'imap_port', flags: '--imap-port <port>', description: 'IMAP port' },
      { field: 'max_email_per_day', flags: '--max-email-per-day <n>', description: 'Max emails per day' },
      { field: 'bcc', flags: '--bcc <email>', description: 'BCC email address' },
      { field: 'signature', flags: '--signature <html>', description: 'Email signature HTML' },
    ],
  },
  endpoint: { method: 'POST', path: '/email-accounts/save' },
  fieldMappings: {
    from_name: 'body', from_email: 'body', username: 'body', password: 'body',
    smtp_host: 'body', smtp_port: 'body', smtp_port_type: 'body',
    imap_host: 'body', imap_port: 'body', max_email_per_day: 'body',
    bcc: 'body', signature: 'body',
  },
  handler: (input, client) => executeCommand(createCommand, input, client),
};

const updateCommand: CommandDefinition = {
  name: 'email_accounts_update',
  group: 'email-accounts',
  subcommand: 'update',
  description: 'Update an existing email account.',
  examples: ['smartlead email-accounts update 789 --max-email-per-day 100'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
    from_name: z.string().optional().describe('Sender display name'),
    from_email: z.string().email().optional().describe('Sender email address'),
    username: z.string().optional().describe('SMTP/IMAP username'),
    password: z.string().optional().describe('SMTP/IMAP password'),
    smtp_host: z.string().optional().describe('SMTP server hostname'),
    smtp_port: z.coerce.number().optional().describe('SMTP port'),
    smtp_port_type: z.enum(['TLS', 'SSL', 'STARTTLS']).optional().describe('SMTP port type'),
    imap_host: z.string().optional().describe('IMAP server hostname'),
    imap_port: z.coerce.number().optional().describe('IMAP port'),
    max_email_per_day: z.coerce.number().optional().describe('Max emails per day'),
    bcc: z.string().optional().describe('BCC email address'),
    signature: z.string().optional().describe('Email signature HTML'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: true }],
    options: [
      { field: 'from_name', flags: '--from-name <name>', description: 'Sender display name' },
      { field: 'from_email', flags: '--from-email <email>', description: 'Sender email address' },
      { field: 'username', flags: '--username <user>', description: 'SMTP/IMAP username' },
      { field: 'password', flags: '--password <pass>', description: 'SMTP/IMAP password' },
      { field: 'smtp_host', flags: '--smtp-host <host>', description: 'SMTP server hostname' },
      { field: 'smtp_port', flags: '--smtp-port <port>', description: 'SMTP port' },
      { field: 'smtp_port_type', flags: '--smtp-port-type <type>', description: 'SMTP type' },
      { field: 'imap_host', flags: '--imap-host <host>', description: 'IMAP server hostname' },
      { field: 'imap_port', flags: '--imap-port <port>', description: 'IMAP port' },
      { field: 'max_email_per_day', flags: '--max-email-per-day <n>', description: 'Max emails per day' },
      { field: 'bcc', flags: '--bcc <email>', description: 'BCC email address' },
      { field: 'signature', flags: '--signature <html>', description: 'Email signature HTML' },
    ],
  },
  endpoint: { method: 'POST', path: '/email-accounts/{email_account_id}' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { email_account_id, ...body } = input;
    return client.post(`/email-accounts/${encodeURIComponent(email_account_id)}`, body);
  },
};

const deleteCommand: CommandDefinition = {
  name: 'email_accounts_delete',
  group: 'email-accounts',
  subcommand: 'delete',
  description: 'Permanently delete an email account. Removes it from all campaigns and stops warmup.',
  examples: ['smartlead email-accounts delete 789'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: true }],
  },
  endpoint: { method: 'DELETE', path: '/email-accounts/{email_account_id}' },
  fieldMappings: { email_account_id: 'path' },
  handler: (input, client) => executeCommand(deleteCommand, input, client),
};

const suspendCommand: CommandDefinition = {
  name: 'email_accounts_suspend',
  group: 'email-accounts',
  subcommand: 'suspend',
  description: 'Temporarily suspend an email account from all sending.',
  examples: ['smartlead email-accounts suspend 789'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: true }],
  },
  endpoint: { method: 'PUT', path: '/email-accounts/suspend/{email_account_id}' },
  fieldMappings: { email_account_id: 'path' },
  handler: (input, client) => executeCommand(suspendCommand, input, client),
};

const unsuspendCommand: CommandDefinition = {
  name: 'email_accounts_unsuspend',
  group: 'email-accounts',
  subcommand: 'unsuspend',
  description: 'Reactivate a suspended email account.',
  examples: ['smartlead email-accounts unsuspend 789'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: true }],
  },
  endpoint: { method: 'DELETE', path: '/email-accounts/unsuspend/{email_account_id}' },
  fieldMappings: { email_account_id: 'path' },
  handler: (input, client) => executeCommand(unsuspendCommand, input, client),
};

// ─── Warmup ───────────────────────────────────────────────────────────────────

const updateWarmupCommand: CommandDefinition = {
  name: 'email_accounts_update_warmup',
  group: 'email-accounts',
  subcommand: 'update-warmup',
  description: 'Configure email warmup settings for an account.',
  examples: ['smartlead email-accounts update-warmup 789 --warmup-enabled --total-warmup-per-day 20 --daily-rampup 2 --reply-rate 30'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
    warmup_enabled: z.boolean().optional().describe('Enable or disable warmup'),
    total_warmup_per_day: z.coerce.number().optional().describe('Total warmup emails per day'),
    daily_rampup: z.coerce.number().optional().describe('Daily ramp-up increment'),
    reply_rate_percentage: z.coerce.number().optional().describe('Warmup reply rate percentage (0-100)'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: true }],
    options: [
      { field: 'warmup_enabled', flags: '--warmup-enabled', description: 'Enable warmup' },
      { field: 'total_warmup_per_day', flags: '--total-warmup-per-day <n>', description: 'Total warmup per day' },
      { field: 'daily_rampup', flags: '--daily-rampup <n>', description: 'Daily ramp-up increment' },
      { field: 'reply_rate_percentage', flags: '--reply-rate <n>', description: 'Reply rate percentage' },
    ],
  },
  endpoint: { method: 'POST', path: '/email-accounts/{email_account_id}/warmup' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { email_account_id, ...body } = input;
    return client.post(`/email-accounts/${encodeURIComponent(email_account_id)}/warmup`, body);
  },
};

const getWarmupStatsCommand: CommandDefinition = {
  name: 'email_accounts_get_warmup_stats',
  group: 'email-accounts',
  subcommand: 'warmup-stats',
  description: 'Fetch warmup stats for an email account (last 7 days: sent, spam, inbox placement).',
  examples: ['smartlead email-accounts warmup-stats 789'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    args: [{ field: 'email_account_id', name: 'email_account_id', required: false }],
    options: [{ field: 'email_account_id', flags: '--account-id <id>', description: 'Email account ID' }],
  },
  endpoint: { method: 'GET', path: '/email-accounts/{email_account_id}/warmup-stats' },
  fieldMappings: { email_account_id: 'path' },
  handler: (input, client) => executeCommand(getWarmupStatsCommand, input, client),
};

// ─── Campaign assignment ──────────────────────────────────────────────────────

const listCampaignAccountsCommand: CommandDefinition = {
  name: 'email_accounts_list_campaign',
  group: 'email-accounts',
  subcommand: 'list-campaign',
  description: 'List all email accounts assigned to a specific campaign.',
  examples: ['smartlead email-accounts list-campaign --campaign-id 456'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    options: [{ field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' }],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/email-accounts' },
  fieldMappings: { campaign_id: 'path' },
  handler: (input, client) => executeCommand(listCampaignAccountsCommand, input, client),
};

const addToCampaignCommand: CommandDefinition = {
  name: 'email_accounts_add_to_campaign',
  group: 'email-accounts',
  subcommand: 'add-to-campaign',
  description: 'Add an email account to a campaign.',
  examples: ['smartlead email-accounts add-to-campaign --campaign-id 456 --account-id 789'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    email_account_id: z.coerce.number().describe('Email account ID to add'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'email_account_id', flags: '--account-id <id>', description: 'Email account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/email-accounts' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, email_account_id } = input;
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/email-accounts`, { email_account_ids: [email_account_id] });
  },
};

const removeFromCampaignCommand: CommandDefinition = {
  name: 'email_accounts_remove_from_campaign',
  group: 'email-accounts',
  subcommand: 'remove-from-campaign',
  description: 'Remove an email account from a campaign.',
  examples: ['smartlead email-accounts remove-from-campaign --campaign-id 456 --account-id 789'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    email_account_id: z.coerce.number().describe('Email account ID to remove'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'email_account_id', flags: '--account-id <id>', description: 'Email account ID' },
    ],
  },
  endpoint: { method: 'DELETE', path: '/campaigns/{campaign_id}/email-accounts' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, email_account_id } = input;
    return client.delete(`/campaigns/${encodeURIComponent(campaign_id)}/email-accounts`, { email_account_id });
  },
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

const createTagCommand: CommandDefinition = {
  name: 'email_accounts_create_tag',
  group: 'email-accounts',
  subcommand: 'create-tag',
  description: 'Create or update an email account tag (for organizing accounts).',
  examples: ['smartlead email-accounts create-tag --name "Gmail Accounts" --color "#4285F4"'],
  inputSchema: z.object({
    name: z.string().describe('Tag name'),
    color: z.string().optional().describe('Tag hex color (e.g., #4285F4)'),
    id: z.coerce.number().optional().describe('Tag ID to update (omit to create new)'),
  }),
  cliMappings: {
    options: [
      { field: 'name', flags: '--name <name>', description: 'Tag name' },
      { field: 'color', flags: '--color <hex>', description: 'Tag hex color' },
      { field: 'id', flags: '--id <id>', description: 'Tag ID to update (omit to create)' },
    ],
  },
  endpoint: { method: 'POST', path: '/email-accounts/tag-manager' },
  fieldMappings: { name: 'body', color: 'body', id: 'body' },
  handler: (input, client) => executeCommand(createTagCommand, input, client),
};

const assignTagsCommand: CommandDefinition = {
  name: 'email_accounts_assign_tags',
  group: 'email-accounts',
  subcommand: 'assign-tags',
  description: 'Assign existing tags to email accounts (up to 25 accounts at once).',
  examples: ['smartlead email-accounts assign-tags --emails \'["john@domain.com","jane@domain.com"]\' --tag-ids \'[1,2]\''],
  inputSchema: z.object({
    emails: z.string().describe('JSON array of email account addresses'),
    tag_ids: z.string().describe('JSON array of tag IDs to assign'),
  }),
  cliMappings: {
    options: [
      { field: 'emails', flags: '--emails <json>', description: 'JSON array of email addresses' },
      { field: 'tag_ids', flags: '--tag-ids <json>', description: 'JSON array of tag IDs' },
    ],
  },
  endpoint: { method: 'POST', path: '/email-accounts/tag-mapping' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { emails, tag_ids } = input;
    let emailArr: any[], tagArr: any[];
    try { emailArr = JSON.parse(emails); } catch { throw new Error('Invalid --emails JSON. Expected array like: ["email@domain.com"]'); }
    try { tagArr = JSON.parse(tag_ids); } catch { throw new Error('Invalid --tag-ids JSON. Expected array like: [1,2]'); }
    return client.post('/email-accounts/tag-mapping', { emails: emailArr, tag_ids: tagArr });
  },
};

const removeTagsCommand: CommandDefinition = {
  name: 'email_accounts_remove_tags',
  group: 'email-accounts',
  subcommand: 'remove-tags',
  description: 'Remove tag associations from email accounts.',
  examples: ['smartlead email-accounts remove-tags --emails \'["john@domain.com"]\' --tag-ids \'[1]\''],
  inputSchema: z.object({
    emails: z.string().describe('JSON array of email account addresses'),
    tag_ids: z.string().describe('JSON array of tag IDs to remove'),
  }),
  cliMappings: {
    options: [
      { field: 'emails', flags: '--emails <json>', description: 'JSON array of email addresses' },
      { field: 'tag_ids', flags: '--tag-ids <json>', description: 'JSON array of tag IDs' },
    ],
  },
  endpoint: { method: 'DELETE', path: '/email-accounts/tag-mapping' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { emails, tag_ids } = input;
    let emailArr: any[], tagArr: any[];
    try { emailArr = JSON.parse(emails); } catch { throw new Error('Invalid --emails JSON'); }
    try { tagArr = JSON.parse(tag_ids); } catch { throw new Error('Invalid --tag-ids JSON'); }
    return client.delete('/email-accounts/tag-mapping', { emails: emailArr, tag_ids: tagArr });
  },
};

export const allEmailAccountsCommands: CommandDefinition[] = [
  listCommand,
  getCommand,
  createCommand,
  updateCommand,
  deleteCommand,
  suspendCommand,
  unsuspendCommand,
  updateWarmupCommand,
  getWarmupStatsCommand,
  listCampaignAccountsCommand,
  addToCampaignCommand,
  removeFromCampaignCommand,
  createTagCommand,
  assignTagsCommand,
  removeTagsCommand,
];
