import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// ─── Campaign-level ───────────────────────────────────────────────────────────

const getStatsCommand: CommandDefinition = {
  name: 'analytics_get_stats',
  group: 'analytics',
  subcommand: 'campaign-stats',
  description: 'Get summary statistics for a campaign (opens, clicks, replies, bounces).',
  examples: ['smartlead analytics campaign-stats --campaign-id 456'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    options: [{ field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' }],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/statistics' },
  fieldMappings: { campaign_id: 'path' },
  handler: (input, client) => executeCommand(getStatsCommand, input, client),
};

const getAnalyticsCommand: CommandDefinition = {
  name: 'analytics_get_analytics',
  group: 'analytics',
  subcommand: 'campaign-analytics',
  description: 'Get top-level performance analytics for a campaign.',
  examples: ['smartlead analytics campaign-analytics --campaign-id 456'],
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
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/analytics' },
  fieldMappings: { campaign_id: 'path', client_id: 'query' },
  handler: (input, client) => executeCommand(getAnalyticsCommand, input, client),
};

const getAnalyticsByDateCommand: CommandDefinition = {
  name: 'analytics_get_by_date',
  group: 'analytics',
  subcommand: 'campaign-analytics-by-date',
  description: 'Get time-series engagement data for a campaign by date range.',
  examples: ['smartlead analytics campaign-analytics-by-date --campaign-id 456 --start-date "2024-01-01" --end-date "2024-01-31"'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/analytics-by-date' },
  fieldMappings: { campaign_id: 'path', start_date: 'query', end_date: 'query', client_id: 'query' },
  handler: (input, client) => executeCommand(getAnalyticsByDateCommand, input, client),
};

const getLeadStatsCommand: CommandDefinition = {
  name: 'analytics_get_lead_stats',
  group: 'analytics',
  subcommand: 'lead-stats',
  description: 'Get lead-level statistics for a campaign (interested, total, not started, in progress, completed, blocked, paused, unsubscribed, stopped).',
  examples: ['smartlead analytics lead-stats --campaign-id 456'],
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
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/lead-statistics' },
  fieldMappings: { campaign_id: 'path', client_id: 'query' },
  handler: (input, client) => executeCommand(getLeadStatsCommand, input, client),
};

const getOverviewCommand: CommandDefinition = {
  name: 'analytics_get_overview',
  group: 'analytics',
  subcommand: 'overview',
  description: 'Get global analytics overview across all campaigns.',
  examples: ['smartlead analytics overview', 'smartlead analytics overview --client-id 123'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/overview' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(getOverviewCommand, input, client),
};

// ─── Deep-dive analytics ─────────────────────────────────────────────────────

const campaignOverallStatsCommand: CommandDefinition = {
  name: 'analytics_campaign_overall_stats',
  group: 'analytics',
  subcommand: 'campaign-overall-stats',
  description: 'Performance metrics per campaign with engagement rates across all campaigns.',
  examples: ['smartlead analytics campaign-overall-stats', 'smartlead analytics campaign-overall-stats --client-id 123'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/campaign/overall-stats' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(campaignOverallStatsCommand, input, client),
};

const campaignResponseStatsCommand: CommandDefinition = {
  name: 'analytics_campaign_response_stats',
  group: 'analytics',
  subcommand: 'campaign-response-stats',
  description: 'Detailed response analysis per campaign with sentiment breakdown.',
  examples: ['smartlead analytics campaign-response-stats --start-date "2024-01-01" --end-date "2024-01-31"'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/campaign/response-stats' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(campaignResponseStatsCommand, input, client),
};

const dayWiseOverallStatsCommand: CommandDefinition = {
  name: 'analytics_day_wise_overall_stats',
  group: 'analytics',
  subcommand: 'day-wise-stats',
  description: 'Day-by-day email engagement breakdown across all campaigns.',
  examples: ['smartlead analytics day-wise-stats --start-date "2024-01-01" --end-date "2024-01-31"'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    campaign_id: z.coerce.number().optional().describe('Filter by specific campaign ID'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/day-wise-overall-stats' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query', campaign_id: 'query' },
  handler: (input, client) => executeCommand(dayWiseOverallStatsCommand, input, client),
};

const dayWisePositiveReplyStatsCommand: CommandDefinition = {
  name: 'analytics_day_wise_positive_reply_stats',
  group: 'analytics',
  subcommand: 'day-wise-positive-replies',
  description: 'Daily positive replies (Interested category) across all campaigns.',
  examples: ['smartlead analytics day-wise-positive-replies --start-date "2024-01-01" --end-date "2024-01-31"'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/day-wise-positive-reply-stats' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(dayWisePositiveReplyStatsCommand, input, client),
};

const mailboxDomainHealthCommand: CommandDefinition = {
  name: 'analytics_mailbox_domain_health',
  group: 'analytics',
  subcommand: 'mailbox-domain-health',
  description: 'Performance metrics aggregated by email domain (e.g., gmail.com vs custom domains).',
  examples: ['smartlead analytics mailbox-domain-health'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/mailbox/domain-wise-health-metrics' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(mailboxDomainHealthCommand, input, client),
};

const mailboxNameHealthCommand: CommandDefinition = {
  name: 'analytics_mailbox_name_health',
  group: 'analytics',
  subcommand: 'mailbox-name-health',
  description: 'Health metrics by individual email account address.',
  examples: ['smartlead analytics mailbox-name-health'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/mailbox/name-wise-health-metrics' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(mailboxNameHealthCommand, input, client),
};

const mailboxProviderPerformanceCommand: CommandDefinition = {
  name: 'analytics_mailbox_provider_performance',
  group: 'analytics',
  subcommand: 'mailbox-provider-performance',
  description: 'Compare email performance across providers (Gmail, Outlook, SMTP).',
  examples: ['smartlead analytics mailbox-provider-performance'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/mailbox/provider-wise-overall-performance' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(mailboxProviderPerformanceCommand, input, client),
};

const leadOverallStatsCommand: CommandDefinition = {
  name: 'analytics_lead_overall_stats',
  group: 'analytics',
  subcommand: 'lead-overall-stats',
  description: 'Comprehensive lead engagement statistics by status and category across all campaigns.',
  examples: ['smartlead analytics lead-overall-stats --start-date "2024-01-01" --end-date "2024-01-31"'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/lead/overall-stats' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(leadOverallStatsCommand, input, client),
};

const leadCategoryResponseCommand: CommandDefinition = {
  name: 'analytics_lead_category_response',
  group: 'analytics',
  subcommand: 'lead-category-response',
  description: 'Lead response breakdown by category with sentiment (Interested, Not Interested, etc.).',
  examples: ['smartlead analytics lead-category-response'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/lead/category-wise-response' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(leadCategoryResponseCommand, input, client),
};

const followUpReplyRateCommand: CommandDefinition = {
  name: 'analytics_follow_up_reply_rate',
  group: 'analytics',
  subcommand: 'follow-up-reply-rate',
  description: 'Reply rates specifically for follow-up sequence steps (step 2, 3, etc.).',
  examples: ['smartlead analytics follow-up-reply-rate --campaign-id 456'],
  inputSchema: z.object({
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/campaign/follow-up-reply-rate' },
  fieldMappings: { campaign_id: 'query', client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(followUpReplyRateCommand, input, client),
};

const teamBoardStatsCommand: CommandDefinition = {
  name: 'analytics_team_board_stats',
  group: 'analytics',
  subcommand: 'team-board-stats',
  description: 'Performance metrics by team member.',
  examples: ['smartlead analytics team-board-stats'],
  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/team-board/overall-stats' },
  fieldMappings: { client_id: 'query', start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(teamBoardStatsCommand, input, client),
};

const clientOverallStatsCommand: CommandDefinition = {
  name: 'analytics_client_overall_stats',
  group: 'analytics',
  subcommand: 'client-overall-stats',
  description: 'Performance metrics by client for agency reporting.',
  examples: ['smartlead analytics client-overall-stats'],
  inputSchema: z.object({
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  cliMappings: {
    options: [
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date' },
    ],
  },
  endpoint: { method: 'GET', path: '/analytics/client/overall-stats' },
  fieldMappings: { start_date: 'query', end_date: 'query' },
  handler: (input, client) => executeCommand(clientOverallStatsCommand, input, client),
};

export const allAnalyticsCommands: CommandDefinition[] = [
  // Campaign-level
  getStatsCommand,
  getAnalyticsCommand,
  getAnalyticsByDateCommand,
  getLeadStatsCommand,
  getOverviewCommand,
  // Deep-dive
  campaignOverallStatsCommand,
  campaignResponseStatsCommand,
  dayWiseOverallStatsCommand,
  dayWisePositiveReplyStatsCommand,
  mailboxDomainHealthCommand,
  mailboxNameHealthCommand,
  mailboxProviderPerformanceCommand,
  leadOverallStatsCommand,
  leadCategoryResponseCommand,
  followUpReplyRateCommand,
  teamBoardStatsCommand,
  clientOverallStatsCommand,
];
