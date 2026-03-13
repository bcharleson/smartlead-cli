import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const verifyEmailsCommand: CommandDefinition = {
  name: 'utils_verify_emails',
  group: 'utils',
  subcommand: 'verify-emails',
  description: 'Verify a list of email addresses for deliverability.',
  examples: [
    'smartlead utils verify-emails --emails \'["john@acme.com","jane@corp.io"]\'',
  ],
  inputSchema: z.object({
    emails: z.string().describe('JSON array of email addresses to verify'),
    webhook_url: z.string().url().optional().describe('Webhook URL to receive results (async mode)'),
  }),
  cliMappings: {
    options: [
      { field: 'emails', flags: '--emails <json>', description: 'JSON array of email addresses' },
      { field: 'webhook_url', flags: '--webhook-url <url>', description: 'Webhook for async results' },
    ],
  },
  endpoint: { method: 'POST', path: '/verify-emails' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { emails, ...rest } = input;
    let emailArr: string[];
    try { emailArr = JSON.parse(emails); }
    catch { throw new Error('Invalid --emails JSON. Expected array of email strings.'); }
    return client.post('/verify-emails', { emails: emailArr, ...rest });
  },
};

const sendEmailInitiateCommand: CommandDefinition = {
  name: 'utils_send_email',
  group: 'utils',
  subcommand: 'send-email',
  description: 'Initiate a one-off transactional email send through Smartlead.',
  examples: [
    'smartlead utils send-email --from "me@acme.com" --to "prospect@corp.io" --subject "Quick question" --body "Hi there..."',
  ],
  inputSchema: z.object({
    from: z.string().email().describe('Sender email address'),
    to: z.string().email().describe('Recipient email address'),
    subject: z.string().describe('Email subject line'),
    body: z.string().describe('Email body (plain text or HTML)'),
    reply_to: z.string().email().optional().describe('Reply-to email address'),
    email_account_id: z.coerce.number().optional().describe('Email account ID to send from'),
    cc: z.string().optional().describe('JSON array of CC email addresses'),
    bcc: z.string().optional().describe('JSON array of BCC email addresses'),
  }),
  cliMappings: {
    options: [
      { field: 'from', flags: '--from <email>', description: 'Sender email' },
      { field: 'to', flags: '--to <email>', description: 'Recipient email' },
      { field: 'subject', flags: '--subject <text>', description: 'Subject line' },
      { field: 'body', flags: '--body <text>', description: 'Email body' },
      { field: 'reply_to', flags: '--reply-to <email>', description: 'Reply-to address' },
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
      { field: 'cc', flags: '--cc <json>', description: 'JSON array of CC emails' },
      { field: 'bcc', flags: '--bcc <json>', description: 'JSON array of BCC emails' },
    ],
  },
  endpoint: { method: 'POST', path: '/send-email/initiate' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { cc, bcc, ...rest } = input;
    const body: Record<string, any> = { ...rest };
    if (cc) {
      try { body.cc = JSON.parse(cc); }
      catch { throw new Error('Invalid --cc JSON. Expected array of email strings.'); }
    }
    if (bcc) {
      try { body.bcc = JSON.parse(bcc); }
      catch { throw new Error('Invalid --bcc JSON. Expected array of email strings.'); }
    }
    return client.post('/send-email/initiate', body);
  },
};

const getDomainBlockListCommand: CommandDefinition = {
  name: 'utils_get_domain_block_list',
  group: 'utils',
  subcommand: 'get-domain-block-list',
  description: 'Get all domains in the global block list.',
  examples: ['smartlead utils get-domain-block-list', 'smartlead utils get-domain-block-list --client-id 12'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
  }),
  cliMappings: {
    options: [{ field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' }],
  },
  endpoint: { method: 'GET', path: '/leads/get-domain-block-list' },
  fieldMappings: { client_id: 'query' },
  handler: (input, client) => executeCommand(getDomainBlockListCommand, input, client),
};

const removeDomainBlockCommand: CommandDefinition = {
  name: 'utils_remove_domain_block',
  group: 'utils',
  subcommand: 'remove-domain-block',
  description: 'Remove a domain from the global block list.',
  examples: ['smartlead utils remove-domain-block --domain "competitor.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to remove from block list'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'domain', flags: '--domain <domain>', description: 'Domain to unblock' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'DELETE', path: '/leads/remove-domain-block-list' },
  fieldMappings: { domain: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(removeDomainBlockCommand, input, client),
};

const getEmailVerificationStatusCommand: CommandDefinition = {
  name: 'utils_email_verify_status',
  group: 'utils',
  subcommand: 'email-verify-status',
  description: 'Check the status of an email verification job.',
  examples: ['smartlead utils email-verify-status --job-id abc123'],
  inputSchema: z.object({
    job_id: z.string().describe('Verification job ID returned from verify-emails'),
  }),
  cliMappings: {
    options: [{ field: 'job_id', flags: '--job-id <id>', description: 'Verification job ID' }],
  },
  endpoint: { method: 'GET', path: '/verify-emails/status' },
  fieldMappings: { job_id: 'query' },
  handler: (input, client) => executeCommand(getEmailVerificationStatusCommand, input, client),
};

const getAccountSettingsCommand: CommandDefinition = {
  name: 'utils_get_account_settings',
  group: 'utils',
  subcommand: 'get-account-settings',
  description: 'Get account-level settings and configuration.',
  examples: ['smartlead utils get-account-settings'],
  inputSchema: z.object({}),
  cliMappings: { options: [] },
  endpoint: { method: 'GET', path: '/account/settings' },
  fieldMappings: {},
  handler: (input, client) => executeCommand(getAccountSettingsCommand, input, client),
};

const updateAccountSettingsCommand: CommandDefinition = {
  name: 'utils_update_account_settings',
  group: 'utils',
  subcommand: 'update-account-settings',
  description: 'Update account-level settings.',
  examples: ['smartlead utils update-account-settings --timezone "America/New_York"'],
  inputSchema: z.object({
    timezone: z.string().optional().describe('Account timezone (e.g., America/New_York)'),
    daily_send_limit: z.coerce.number().optional().describe('Account-wide daily send limit'),
    bounce_threshold: z.coerce.number().optional().describe('Auto-pause threshold for bounce rate (%)'),
    unsubscribe_text: z.string().optional().describe('Default unsubscribe link text'),
  }),
  cliMappings: {
    options: [
      { field: 'timezone', flags: '--timezone <tz>', description: 'Account timezone' },
      { field: 'daily_send_limit', flags: '--daily-send-limit <n>', description: 'Daily send limit' },
      { field: 'bounce_threshold', flags: '--bounce-threshold <n>', description: 'Bounce rate threshold %' },
      { field: 'unsubscribe_text', flags: '--unsubscribe-text <text>', description: 'Unsubscribe link text' },
    ],
  },
  endpoint: { method: 'POST', path: '/account/settings' },
  fieldMappings: { timezone: 'body', daily_send_limit: 'body', bounce_threshold: 'body', unsubscribe_text: 'body' },
  handler: (input, client) => executeCommand(updateAccountSettingsCommand, input, client),
};

const getTeamMembersCommand: CommandDefinition = {
  name: 'utils_get_team_members',
  group: 'utils',
  subcommand: 'get-team-members',
  description: 'List all team members in the account.',
  examples: ['smartlead utils get-team-members'],
  inputSchema: z.object({}),
  cliMappings: { options: [] },
  endpoint: { method: 'GET', path: '/account/team-members' },
  fieldMappings: {},
  handler: (input, client) => executeCommand(getTeamMembersCommand, input, client),
};

export const allUtilsCommands: CommandDefinition[] = [
  verifyEmailsCommand,
  sendEmailInitiateCommand,
  getDomainBlockListCommand,
  removeDomainBlockCommand,
  getEmailVerificationStatusCommand,
  getAccountSettingsCommand,
  updateAccountSettingsCommand,
  getTeamMembersCommand,
];
