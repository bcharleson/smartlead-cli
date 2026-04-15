// Smartlead's "Smart Delivery" product is hosted on a separate base host
// (`smartdelivery.smartlead.ai`), not on `server.smartlead.ai/api/v1`.
// Every command below was wired against phantom `/smart-delivery/*` routes
// on the main host and returned 404 in live testing (audit: 2026-04).
//
// Restoring this group requires adding multi-host support to the client and
// retargeting each command at `smartdelivery.smartlead.ai/api/v1/spam-test/*`.
// Out of scope for a bug-fix release — group is unregistered.

import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// ─── Spam Testing ────────────────────────────────────────────────────────────

const createSpamTestCommand: CommandDefinition = {
  name: 'smart_delivery_create_spam_test',
  group: 'smart-delivery',
  subcommand: 'create-spam-test',
  description: 'Create a new spam test for an email campaign.',
  examples: ['smartlead smart-delivery create-spam-test --campaign-id 456 --sequence-number 1'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    sequence_number: z.coerce.number().optional().describe('Email sequence step number (default: 1)'),
    email_account_id: z.coerce.number().optional().describe('Specific email account to test from'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'sequence_number', flags: '--sequence-number <n>', description: 'Sequence step number' },
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/spam-test/create' },
  fieldMappings: { campaign_id: 'body', sequence_number: 'body', email_account_id: 'body' },
  handler: (input, client) => executeCommand(createSpamTestCommand, input, client),
};

const getSpamTestResultsCommand: CommandDefinition = {
  name: 'smart_delivery_get_spam_test',
  group: 'smart-delivery',
  subcommand: 'get-spam-test',
  description: 'Get spam test results for a campaign.',
  examples: ['smartlead smart-delivery get-spam-test --campaign-id 456'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    options: [{ field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' }],
  },
  endpoint: { method: 'GET', path: '/spam-test/results' },
  fieldMappings: { campaign_id: 'query' },
  handler: (input, client) => executeCommand(getSpamTestResultsCommand, input, client),
};

const listSpamTestsCommand: CommandDefinition = {
  name: 'smart_delivery_list_spam_tests',
  group: 'smart-delivery',
  subcommand: 'list-spam-tests',
  description: 'List all spam tests for the account.',
  examples: ['smartlead smart-delivery list-spam-tests', 'smartlead smart-delivery list-spam-tests --offset 0 --limit 25'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
    ],
  },
  endpoint: { method: 'GET', path: '/spam-test/list' },
  fieldMappings: { offset: 'query', limit: 'query' },
  handler: (input, client) => executeCommand(listSpamTestsCommand, input, client),
};

// ─── DKIM / SPF / DNS Checks ─────────────────────────────────────────────────

const checkDkimCommand: CommandDefinition = {
  name: 'smart_delivery_check_dkim',
  group: 'smart-delivery',
  subcommand: 'check-dkim',
  description: 'Check DKIM configuration for a domain.',
  examples: ['smartlead smart-delivery check-dkim --domain "acme.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to check DKIM for'),
    selector: z.string().optional().describe('DKIM selector (default: google)'),
  }),
  cliMappings: {
    options: [
      { field: 'domain', flags: '--domain <domain>', description: 'Domain name' },
      { field: 'selector', flags: '--selector <selector>', description: 'DKIM selector' },
    ],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/dkim-check' },
  fieldMappings: { domain: 'body', selector: 'body' },
  handler: (input, client) => executeCommand(checkDkimCommand, input, client),
};

const checkSpfCommand: CommandDefinition = {
  name: 'smart_delivery_check_spf',
  group: 'smart-delivery',
  subcommand: 'check-spf',
  description: 'Check SPF record configuration for a domain.',
  examples: ['smartlead smart-delivery check-spf --domain "acme.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to check SPF for'),
  }),
  cliMappings: {
    options: [{ field: 'domain', flags: '--domain <domain>', description: 'Domain name' }],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/spf-check' },
  fieldMappings: { domain: 'body' },
  handler: (input, client) => executeCommand(checkSpfCommand, input, client),
};

const checkDmarcCommand: CommandDefinition = {
  name: 'smart_delivery_check_dmarc',
  group: 'smart-delivery',
  subcommand: 'check-dmarc',
  description: 'Check DMARC record configuration for a domain.',
  examples: ['smartlead smart-delivery check-dmarc --domain "acme.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to check DMARC for'),
  }),
  cliMappings: {
    options: [{ field: 'domain', flags: '--domain <domain>', description: 'Domain name' }],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/dmarc-check' },
  fieldMappings: { domain: 'body' },
  handler: (input, client) => executeCommand(checkDmarcCommand, input, client),
};

const checkMxCommand: CommandDefinition = {
  name: 'smart_delivery_check_mx',
  group: 'smart-delivery',
  subcommand: 'check-mx',
  description: 'Check MX record configuration for a domain.',
  examples: ['smartlead smart-delivery check-mx --domain "acme.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to check MX records for'),
  }),
  cliMappings: {
    options: [{ field: 'domain', flags: '--domain <domain>', description: 'Domain name' }],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/mx-check' },
  fieldMappings: { domain: 'body' },
  handler: (input, client) => executeCommand(checkMxCommand, input, client),
};

const domainHealthCheckCommand: CommandDefinition = {
  name: 'smart_delivery_domain_health',
  group: 'smart-delivery',
  subcommand: 'domain-health',
  description: 'Full domain health check — DKIM, SPF, DMARC, MX, blacklists in one call.',
  examples: ['smartlead smart-delivery domain-health --domain "acme.com"'],
  inputSchema: z.object({
    domain: z.string().describe('Domain to audit'),
  }),
  cliMappings: {
    options: [{ field: 'domain', flags: '--domain <domain>', description: 'Domain name' }],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/domain-health-check' },
  fieldMappings: { domain: 'body' },
  handler: (input, client) => executeCommand(domainHealthCheckCommand, input, client),
};

// ─── Blacklist Checks ─────────────────────────────────────────────────────────

const checkBlacklistCommand: CommandDefinition = {
  name: 'smart_delivery_check_blacklist',
  group: 'smart-delivery',
  subcommand: 'check-blacklist',
  description: 'Check if a domain or IP is on email blacklists.',
  examples: [
    'smartlead smart-delivery check-blacklist --domain "acme.com"',
    'smartlead smart-delivery check-blacklist --ip "1.2.3.4"',
  ],
  inputSchema: z.object({
    domain: z.string().optional().describe('Domain to check'),
    ip: z.string().optional().describe('IP address to check'),
  }),
  cliMappings: {
    options: [
      { field: 'domain', flags: '--domain <domain>', description: 'Domain to check' },
      { field: 'ip', flags: '--ip <ip>', description: 'IP address to check' },
    ],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/blacklist-check' },
  fieldMappings: { domain: 'body', ip: 'body' },
  handler: (input, client) => executeCommand(checkBlacklistCommand, input, client),
};

const listBlacklistsCommand: CommandDefinition = {
  name: 'smart_delivery_list_blacklists',
  group: 'smart-delivery',
  subcommand: 'list-blacklists',
  description: 'List all blacklist providers Smartlead checks against.',
  examples: ['smartlead smart-delivery list-blacklists'],
  inputSchema: z.object({}),
  cliMappings: { options: [] },
  endpoint: { method: 'GET', path: '/smart-delivery/blacklist-providers' },
  fieldMappings: {},
  handler: (input, client) => executeCommand(listBlacklistsCommand, input, client),
};

// ─── Email Warm-up ────────────────────────────────────────────────────────────

const getWarmupStatusCommand: CommandDefinition = {
  name: 'smart_delivery_warmup_status',
  group: 'smart-delivery',
  subcommand: 'warmup-status',
  description: 'Get warm-up status for an email account.',
  examples: ['smartlead smart-delivery warmup-status --email-account-id 123'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    options: [{ field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' }],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/warmup-status' },
  fieldMappings: { email_account_id: 'query' },
  handler: (input, client) => executeCommand(getWarmupStatusCommand, input, client),
};

const getWarmupStatsCommand: CommandDefinition = {
  name: 'smart_delivery_warmup_stats',
  group: 'smart-delivery',
  subcommand: 'warmup-stats',
  description: 'Get detailed warm-up statistics for an email account.',
  examples: ['smartlead smart-delivery warmup-stats --email-account-id 123'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
    start_date: z.string().optional().describe('Start date filter (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date filter (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/warmup-stats' },
  fieldMappings: { email_account_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(getWarmupStatsCommand, input, client),
};

const enableWarmupCommand: CommandDefinition = {
  name: 'smart_delivery_enable_warmup',
  group: 'smart-delivery',
  subcommand: 'enable-warmup',
  description: 'Enable email warm-up for an email account.',
  examples: ['smartlead smart-delivery enable-warmup --email-account-id 123'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
    daily_ramp_up: z.coerce.number().optional().describe('Emails to add per day during ramp-up'),
    warmup_limit: z.coerce.number().optional().describe('Maximum daily warm-up emails'),
    reply_rate: z.coerce.number().optional().describe('Desired reply rate percentage (0–100)'),
  }),
  cliMappings: {
    options: [
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
      { field: 'daily_ramp_up', flags: '--daily-ramp-up <n>', description: 'Emails added per day' },
      { field: 'warmup_limit', flags: '--warmup-limit <n>', description: 'Max daily warmup emails' },
      { field: 'reply_rate', flags: '--reply-rate <n>', description: 'Target reply rate %' },
    ],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/warmup/enable' },
  fieldMappings: { email_account_id: 'body', daily_ramp_up: 'body', warmup_limit: 'body', reply_rate: 'body' },
  handler: (input, client) => executeCommand(enableWarmupCommand, input, client),
};

const disableWarmupCommand: CommandDefinition = {
  name: 'smart_delivery_disable_warmup',
  group: 'smart-delivery',
  subcommand: 'disable-warmup',
  description: 'Disable email warm-up for an email account.',
  examples: ['smartlead smart-delivery disable-warmup --email-account-id 123'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    options: [{ field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' }],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/warmup/disable' },
  fieldMappings: { email_account_id: 'body' },
  handler: (input, client) => executeCommand(disableWarmupCommand, input, client),
};

// ─── Deliverability Reports ───────────────────────────────────────────────────

const getDeliverabilityReportCommand: CommandDefinition = {
  name: 'smart_delivery_deliverability_report',
  group: 'smart-delivery',
  subcommand: 'deliverability-report',
  description: 'Get overall email deliverability report for the account.',
  examples: ['smartlead smart-delivery deliverability-report'],
  inputSchema: z.object({
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    email_account_id: z.coerce.number().optional().describe('Filter by email account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
    ],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/deliverability-report' },
  fieldMappings: { start_date: 'query', end_date: 'query', email_account_id: 'query' },
  handler: (input, client) => executeCommand(getDeliverabilityReportCommand, input, client),
};

const getInboxPlacementCommand: CommandDefinition = {
  name: 'smart_delivery_inbox_placement',
  group: 'smart-delivery',
  subcommand: 'inbox-placement',
  description: 'Get inbox placement rates — inbox vs spam vs promotions.',
  examples: ['smartlead smart-delivery inbox-placement --email-account-id 123'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().optional().describe('Filter by email account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/inbox-placement' },
  fieldMappings: { email_account_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(getInboxPlacementCommand, input, client),
};

const getSpamScoreCommand: CommandDefinition = {
  name: 'smart_delivery_spam_score',
  group: 'smart-delivery',
  subcommand: 'spam-score',
  description: 'Analyze email content for spam score before sending.',
  examples: ['smartlead smart-delivery spam-score --subject "Quick question" --body "Hi {{first_name}}, ..."'],
  inputSchema: z.object({
    subject: z.string().describe('Email subject line to analyze'),
    body: z.string().describe('Email body HTML or plain text'),
  }),
  cliMappings: {
    options: [
      { field: 'subject', flags: '--subject <text>', description: 'Email subject line' },
      { field: 'body', flags: '--body <text>', description: 'Email body content' },
    ],
  },
  endpoint: { method: 'POST', path: '/smart-delivery/spam-score' },
  fieldMappings: { subject: 'body', body: 'body' },
  handler: (input, client) => executeCommand(getSpamScoreCommand, input, client),
};

// ─── Account Health ───────────────────────────────────────────────────────────

const getAccountHealthCommand: CommandDefinition = {
  name: 'smart_delivery_account_health',
  group: 'smart-delivery',
  subcommand: 'account-health',
  description: 'Get sending health score and recommendations for an email account.',
  examples: ['smartlead smart-delivery account-health --email-account-id 123'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().describe('Email account ID'),
  }),
  cliMappings: {
    options: [{ field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' }],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/account-health' },
  fieldMappings: { email_account_id: 'query' },
  handler: (input, client) => executeCommand(getAccountHealthCommand, input, client),
};

const getBounceRateCommand: CommandDefinition = {
  name: 'smart_delivery_bounce_rate',
  group: 'smart-delivery',
  subcommand: 'bounce-rate',
  description: 'Get bounce rate analytics for email accounts.',
  examples: ['smartlead smart-delivery bounce-rate --email-account-id 123 --start-date "2024-01-01"'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().optional().describe('Filter by email account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/bounce-rate' },
  fieldMappings: { email_account_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(getBounceRateCommand, input, client),
};

const getComplaintRateCommand: CommandDefinition = {
  name: 'smart_delivery_complaint_rate',
  group: 'smart-delivery',
  subcommand: 'complaint-rate',
  description: 'Get spam complaint rate analytics for email accounts.',
  examples: ['smartlead smart-delivery complaint-rate'],
  inputSchema: z.object({
    email_account_id: z.coerce.number().optional().describe('Filter by email account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'email_account_id', flags: '--email-account-id <id>', description: 'Email account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },
  endpoint: { method: 'GET', path: '/smart-delivery/complaint-rate' },
  fieldMappings: { email_account_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(getComplaintRateCommand, input, client),
};

// Unregistered: Smart Delivery lives on `smartdelivery.smartlead.ai`, not
// on the main API host. Restoring the group requires client-level multi-host
// support and live retesting of each route.
export const allSmartDeliveryCommands: CommandDefinition[] = [];
