import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// ─── Core CRUD ───────────────────────────────────────────────────────────────

const listCommand: CommandDefinition = {
  name: 'campaigns_list',
  group: 'campaigns',
  subcommand: 'list',
  description: 'List all campaigns.',
  examples: ['smartlead campaigns list', 'smartlead campaigns list --client-id 123'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    include_tags: z.boolean().optional().describe('Include campaign tags in response'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client ID' },
      { field: 'include_tags', flags: '--include-tags', description: 'Include campaign tags' },
    ],
  },
  endpoint: { method: 'GET', path: '/campaigns/' },
  fieldMappings: { client_id: 'query', include_tags: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(listCommand, input, client),
};

const getCommand: CommandDefinition = {
  name: 'campaigns_get',
  group: 'campaigns',
  subcommand: 'get',
  description: 'Get a campaign by ID.',
  examples: ['smartlead campaigns get <campaign_id>'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: false }],
    options: [{ field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' }],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}' },
  fieldMappings: { campaign_id: 'path' },
  handler: (input, client) => executeCommand(getCommand, input, client),
};

const createCommand: CommandDefinition = {
  name: 'campaigns_create',
  group: 'campaigns',
  subcommand: 'create',
  description: 'Create a new campaign. Starts in DRAFTED status.',
  examples: ['smartlead campaigns create --name "Q1 Outreach"'],
  inputSchema: z.object({
    name: z.string().describe('Campaign name'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'name', flags: '--name <name>', description: 'Campaign name' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/create' },
  fieldMappings: { name: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(createCommand, input, client),
};

const updateStatusCommand: CommandDefinition = {
  name: 'campaigns_update_status',
  group: 'campaigns',
  subcommand: 'update-status',
  description: 'Update campaign status. Valid values: ACTIVE, PAUSED, STOPPED.',
  examples: ['smartlead campaigns update-status 456 --status ACTIVE'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    status: z.enum(['ACTIVE', 'PAUSED', 'STOPPED']).describe('New campaign status'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [{ field: 'status', flags: '--status <status>', description: 'ACTIVE, PAUSED, or STOPPED' }],
  },
  endpoint: { method: 'PATCH', path: '/campaigns/{campaign_id}/status' },
  fieldMappings: { campaign_id: 'path', status: 'body' },
  handler: (input, client) => executeCommand(updateStatusCommand, input, client),
};

const updateSettingsCommand: CommandDefinition = {
  name: 'campaigns_update_settings',
  group: 'campaigns',
  subcommand: 'update-settings',
  description: 'Update campaign settings: tracking, stop rules, unsubscribe text, AI ESP matching.',
  examples: ['smartlead campaigns update-settings 456 --track-settings \'["DONT_LINK_CLICK"]\''],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    track_settings: z.string().optional().describe('JSON array: DONT_EMAIL_OPEN, DONT_LINK_CLICK, DONT_REPLY_TO_AN_EMAIL'),
    stop_lead_settings: z.string().optional().describe('JSON stop rules per lead behavior'),
    unsubscribe_text: z.string().optional().describe('Unsubscribe link/text in email footer'),
    send_as_plain_text: z.boolean().optional().describe('Send emails as plain text'),
    follow_up_percentage: z.coerce.number().optional().describe('AI reply follow-up rate (0-100)'),
    ai_esp_matching: z.boolean().optional().describe('Enable AI ESP matching'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [
      { field: 'track_settings', flags: '--track-settings <json>', description: 'JSON tracking settings array' },
      { field: 'stop_lead_settings', flags: '--stop-lead-settings <json>', description: 'JSON stop lead rules' },
      { field: 'unsubscribe_text', flags: '--unsubscribe-text <text>', description: 'Unsubscribe text' },
      { field: 'send_as_plain_text', flags: '--send-as-plain-text', description: 'Send as plain text' },
      { field: 'follow_up_percentage', flags: '--follow-up-percentage <n>', description: 'AI follow-up rate (0-100)' },
      { field: 'ai_esp_matching', flags: '--ai-esp-matching', description: 'Enable AI ESP matching' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/settings' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, track_settings, stop_lead_settings, ...rest } = input;
    const body: Record<string, any> = { ...rest };
    if (track_settings) {
      try { body.track_settings = JSON.parse(track_settings); }
      catch { throw new Error('Invalid --track-settings JSON. Expected array like: ["DONT_LINK_CLICK"]'); }
    }
    if (stop_lead_settings) {
      try { body.stop_lead_settings = JSON.parse(stop_lead_settings); }
      catch { throw new Error('Invalid --stop-lead-settings JSON'); }
    }
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/settings`, body);
  },
};

const scheduleCommand: CommandDefinition = {
  name: 'campaigns_schedule',
  group: 'campaigns',
  subcommand: 'schedule',
  description: 'Set or update campaign sending schedule.',
  examples: [
    'smartlead campaigns schedule 456 --timezone "America/New_York" --days-of-week "[1,2,3,4,5]" --start-hour "08:00" --end-hour "17:00" --max-leads-per-day 50',
  ],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    timezone: z.string().optional().describe('Timezone (e.g., America/New_York)'),
    days_of_the_week: z.string().optional().describe('JSON array of days (0=Sun, 6=Sat): [1,2,3,4,5]'),
    start_hour: z.string().optional().describe('Send start time (HH:MM, 24h)'),
    end_hour: z.string().optional().describe('Send end time (HH:MM, 24h)'),
    min_time_btw_emails: z.coerce.number().optional().describe('Minimum minutes between emails'),
    max_leads_per_day: z.coerce.number().optional().describe('Maximum leads emailed per day'),
    schedule_start_time: z.string().optional().describe('Campaign start datetime (ISO 8601)'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [
      { field: 'timezone', flags: '--timezone <tz>', description: 'Timezone (e.g., America/New_York)' },
      { field: 'days_of_the_week', flags: '--days-of-week <json>', description: 'JSON array of days [0-6]' },
      { field: 'start_hour', flags: '--start-hour <time>', description: 'Start time HH:MM (24h)' },
      { field: 'end_hour', flags: '--end-hour <time>', description: 'End time HH:MM (24h)' },
      { field: 'min_time_btw_emails', flags: '--min-time-between-emails <min>', description: 'Min minutes between emails' },
      { field: 'max_leads_per_day', flags: '--max-leads-per-day <n>', description: 'Max leads per day' },
      { field: 'schedule_start_time', flags: '--schedule-start-time <iso>', description: 'Campaign start datetime' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/schedule' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, days_of_the_week, ...rest } = input;
    const body: Record<string, any> = { ...rest };
    if (days_of_the_week) {
      try { body.days_of_the_week = JSON.parse(days_of_the_week); }
      catch { throw new Error('Invalid --days-of-week JSON. Expected array like: [1,2,3,4,5]'); }
    }
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/schedule`, body);
  },
};

const deleteCommand: CommandDefinition = {
  name: 'campaigns_delete',
  group: 'campaigns',
  subcommand: 'delete',
  description: 'Delete a campaign. This is irreversible.',
  examples: ['smartlead campaigns delete 456'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: false }],
    options: [{ field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' }],
  },
  endpoint: { method: 'DELETE', path: '/campaigns/{campaign_id}' },
  fieldMappings: { campaign_id: 'path' },
  handler: (input, client) => executeCommand(deleteCommand, input, client),
};

// ─── Extras ──────────────────────────────────────────────────────────────────

const sendTestEmailCommand: CommandDefinition = {
  name: 'campaigns_send_test_email',
  group: 'campaigns',
  subcommand: 'send-test-email',
  description: 'Send a test email from a specific sequence step to verify rendering.',
  examples: ['smartlead campaigns send-test-email 456 --to "you@domain.com" --seq-number 1'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    to: z.string().describe('Recipient email address for test'),
    seq_number: z.coerce.number().describe('Sequence step number to test (1-indexed)'),
    email_account_id: z.coerce.number().optional().describe('Email account to send from'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [
      { field: 'to', flags: '--to <email>', description: 'Test recipient email' },
      { field: 'seq_number', flags: '--seq-number <n>', description: 'Sequence step number' },
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account to send from' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/send-test-email' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, ...body } = input;
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/send-test-email`, body);
  },
};

const updateLeadCategoryCommand: CommandDefinition = {
  name: 'campaigns_update_lead_category',
  group: 'campaigns',
  subcommand: 'update-lead-category',
  description: "Update a lead's category within a campaign. Categories: Interested, Not Interested, Meeting Booked, Out of Office, Wrong Person, Do Not Contact, Information, No Response.",
  examples: ['smartlead campaigns update-lead-category --campaign-id 456 --lead-id 789 --category "Interested"'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
    category: z.string().describe('Category name'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'category', flags: '--category <name>', description: 'Lead category name' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads/{lead_id}/category' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, lead_id, category } = input;
    return client.post(
      `/campaigns/${encodeURIComponent(campaign_id)}/leads/${encodeURIComponent(lead_id)}/category`,
      { category },
    );
  },
};

const manualCompleteLeadCommand: CommandDefinition = {
  name: 'campaigns_manual_complete_lead',
  group: 'campaigns',
  subcommand: 'manual-complete-lead',
  description: 'Manually mark a lead as completed — stops emails without unsubscribing.',
  examples: ['smartlead campaigns manual-complete-lead --campaign-id 456 --lead-id 789'],
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
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/leads/{lead_id}/manual-complete' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(manualCompleteLeadCommand, input, client),
};

const getMailboxStatsCommand: CommandDefinition = {
  name: 'campaigns_get_mailbox_stats',
  group: 'campaigns',
  subcommand: 'mailbox-stats',
  description: 'Get performance breakdown by email account for a campaign.',
  examples: ['smartlead campaigns mailbox-stats --campaign-id 456'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/mailbox-stats' },
  fieldMappings: { campaign_id: 'path', client_id: 'query' },
  handler: (input, client) => executeCommand(getMailboxStatsCommand, input, client),
};

const getLeadByIdCommand: CommandDefinition = {
  name: 'campaigns_get_lead',
  group: 'campaigns',
  subcommand: 'get-lead',
  description: 'Get a specific lead by ID within a campaign (contact info, engagement, custom fields).',
  examples: ['smartlead campaigns get-lead --campaign-id 456 --lead-id 789'],
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
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/leads/{lead_id}' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(getLeadByIdCommand, input, client),
};

const getAllLeadActivitiesCommand: CommandDefinition = {
  name: 'campaigns_all_lead_activities',
  group: 'campaigns',
  subcommand: 'all-lead-activities',
  description: 'Get all lead activities (opens, clicks, replies) across ALL campaigns.',
  examples: ['smartlead campaigns all-lead-activities --limit 50'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'GET', path: '/campaigns/all-leads-activities' },
  fieldMappings: { offset: 'query', limit: 'query', client_id: 'query' },
  handler: (input, client) => executeCommand(getAllLeadActivitiesCommand, input, client),
};

const createSubsequenceCommand: CommandDefinition = {
  name: 'campaigns_create_subsequence',
  group: 'campaigns',
  subcommand: 'create-subsequence',
  description: 'Create a subsequence (child campaign) with conditional branching — triggered when a lead meets criteria in the parent campaign.',
  examples: ['smartlead campaigns create-subsequence 456 --name "No Reply Follow-up" --trigger "NO_REPLY"'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Parent campaign ID'),
    name: z.string().describe('Subsequence name'),
    trigger: z.string().optional().describe('Trigger condition: NO_REPLY, OPENED, CLICKED, REPLIED'),
    trigger_seq_number: z.coerce.number().optional().describe('Sequence step number that triggers this subsequence'),
  }),
  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [
      { field: 'name', flags: '--name <name>', description: 'Subsequence name' },
      { field: 'trigger', flags: '--trigger <condition>', description: 'Trigger: NO_REPLY, OPENED, CLICKED, REPLIED' },
      { field: 'trigger_seq_number', flags: '--trigger-seq-number <n>', description: 'Triggering step number' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/create-subsequence' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, ...body } = input;
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/create-subsequence`, body);
  },
};

const updateLeadEmailAccountCommand: CommandDefinition = {
  name: 'campaigns_update_lead_email_account',
  group: 'campaigns',
  subcommand: 'update-lead-email-account',
  description: 'Change which email account sends to a specific lead in a campaign.',
  examples: ['smartlead campaigns update-lead-email-account --campaign-id 456 --lead-id 789 --email-account-id 101'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
    email_account_id: z.coerce.number().describe('New email account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/update-lead-email-account' },
  fieldMappings: { campaign_id: 'body', lead_id: 'body', email_account_id: 'body' },
  handler: (input, client) => executeCommand(updateLeadEmailAccountCommand, input, client),
};

export const allCampaignsCommands: CommandDefinition[] = [
  listCommand,
  getCommand,
  createCommand,
  updateStatusCommand,
  updateSettingsCommand,
  scheduleCommand,
  deleteCommand,
  sendTestEmailCommand,
  updateLeadCategoryCommand,
  manualCompleteLeadCommand,
  getMailboxStatsCommand,
  getLeadByIdCommand,
  getAllLeadActivitiesCommand,
  createSubsequenceCommand,
  updateLeadEmailAccountCommand,
];
