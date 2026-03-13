import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// ─── Thread / Message History ────────────────────────────────────────────────

const getMessageHistoryCommand: CommandDefinition = {
  name: 'inbox_get_message_history',
  group: 'inbox',
  subcommand: 'message-history',
  description: 'Fetch the full email thread/message history for a lead in a campaign.',
  examples: ['smartlead inbox message-history --campaign-id 456 --lead-id 789'],
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
  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/leads/{lead_id}/message-history' },
  fieldMappings: { campaign_id: 'path', lead_id: 'path' },
  handler: (input, client) => executeCommand(getMessageHistoryCommand, input, client),
};

const replyEmailCommand: CommandDefinition = {
  name: 'inbox_reply_email',
  group: 'inbox',
  subcommand: 'reply',
  description: 'Reply to a lead via the Master Inbox. Sends a reply in the existing email thread.',
  examples: [
    'smartlead inbox reply --campaign-id 456 --lead-id 789 --email-body "<p>Thanks!</p>" --email-stats-id 111 --reply-message-id "abc@mail.gmail.com"',
  ],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
    email_body: z.string().describe('HTML email body content'),
    email_stats_id: z.coerce.number().describe('Email stats ID (from message history)'),
    reply_message_id: z.string().describe('Message ID to reply to (from message history)'),
    cc: z.string().optional().describe('Comma-separated CC email addresses'),
    bcc: z.string().optional().describe('Comma-separated BCC email addresses'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'email_body', flags: '--email-body <html>', description: 'HTML email body' },
      { field: 'email_stats_id', flags: '--email-stats-id <id>', description: 'Email stats ID' },
      { field: 'reply_message_id', flags: '--reply-message-id <id>', description: 'Message ID to reply to' },
      { field: 'cc', flags: '--cc <emails>', description: 'Comma-separated CC emails' },
      { field: 'bcc', flags: '--bcc <emails>', description: 'Comma-separated BCC emails' },
    ],
  },
  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/reply-email-thread' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { campaign_id, lead_id, cc, bcc, ...rest } = input;
    const body: Record<string, any> = { ...rest, lead_id };
    if (cc) body.cc = cc.split(',').map((e: string) => e.trim());
    if (bcc) body.bcc = bcc.split(',').map((e: string) => e.trim());
    return client.post(`/campaigns/${encodeURIComponent(campaign_id)}/reply-email-thread`, body);
  },
};

// ─── Unified Master Inbox ─────────────────────────────────────────────────────

const listRepliesCommand: CommandDefinition = {
  name: 'inbox_list_replies',
  group: 'inbox',
  subcommand: 'list-replies',
  description: 'Get all lead replies across all campaigns (primary unified inbox view).',
  examples: [
    'smartlead inbox list-replies',
    'smartlead inbox list-replies --offset 0 --limit 25 --campaign-id 456',
  ],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/inbox-replies' },
  fieldMappings: {
    offset: 'body',
    limit: 'body',
    campaign_id: 'body',
    client_id: 'body',
  },
  handler: (input, client) => executeCommand(listRepliesCommand, input, client),
};

const listUnreadCommand: CommandDefinition = {
  name: 'inbox_list_unread',
  group: 'inbox',
  subcommand: 'list-unread',
  description: 'Get all unread replies across all campaigns.',
  examples: ['smartlead inbox list-unread', 'smartlead inbox list-unread --campaign-id 456'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/unread-replies' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listUnreadCommand, input, client),
};

const getInboxItemCommand: CommandDefinition = {
  name: 'inbox_get_item',
  group: 'inbox',
  subcommand: 'get',
  description: 'Get a specific master inbox item by ID.',
  examples: ['smartlead inbox get 999'],
  inputSchema: z.object({
    id: z.coerce.number().describe('Inbox item ID'),
  }),
  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },
  endpoint: { method: 'GET', path: '/master-inbox/{id}' },
  fieldMappings: { id: 'path' },
  handler: (input, client) => executeCommand(getInboxItemCommand, input, client),
};

const updateCategoryCommand: CommandDefinition = {
  name: 'inbox_update_category',
  group: 'inbox',
  subcommand: 'update-category',
  description: 'Update a lead\'s category from the inbox (Interested, Not Interested, Meeting Booked, etc.).',
  examples: [
    'smartlead inbox update-category --lead-id 789 --campaign-id 456 --category "Interested"',
    'smartlead inbox update-category --lead-id 789 --campaign-id 456 --category "Not Interested"',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    category: z.string().describe('Category name: Interested, Not Interested, Meeting Booked, Out of Office, Wrong Person, Do Not Contact, Information, No Response'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'category', flags: '--category <name>', description: 'Lead category name' },
    ],
  },
  endpoint: { method: 'PATCH', path: '/master-inbox/update-category' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', category: 'body' },
  handler: (input, client) => executeCommand(updateCategoryCommand, input, client),
};

const changeReadStatusCommand: CommandDefinition = {
  name: 'inbox_change_read_status',
  group: 'inbox',
  subcommand: 'change-read-status',
  description: 'Mark inbox conversation(s) as read or unread.',
  examples: [
    'smartlead inbox change-read-status --lead-id 789 --campaign-id 456 --is-read true',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    is_read: z.boolean().describe('true = mark read, false = mark unread'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'is_read', flags: '--is-read', description: 'Mark as read' },
    ],
  },
  endpoint: { method: 'PATCH', path: '/master-inbox/change-read-status' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', is_read: 'body' },
  handler: (input, client) => executeCommand(changeReadStatusCommand, input, client),
};

const listArchivedCommand: CommandDefinition = {
  name: 'inbox_list_archived',
  group: 'inbox',
  subcommand: 'list-archived',
  description: 'Get archived inbox emails.',
  examples: ['smartlead inbox list-archived', 'smartlead inbox list-archived --campaign-id 456'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/archived' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listArchivedCommand, input, client),
};

const listSentCommand: CommandDefinition = {
  name: 'inbox_list_sent',
  group: 'inbox',
  subcommand: 'list-sent',
  description: 'Get sent emails from the unified inbox.',
  examples: ['smartlead inbox list-sent --campaign-id 456'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/sent' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listSentCommand, input, client),
};

const listScheduledCommand: CommandDefinition = {
  name: 'inbox_list_scheduled',
  group: 'inbox',
  subcommand: 'list-scheduled',
  description: 'Get scheduled outbound emails.',
  examples: ['smartlead inbox list-scheduled'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/scheduled' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listScheduledCommand, input, client),
};

const listSnoozedCommand: CommandDefinition = {
  name: 'inbox_list_snoozed',
  group: 'inbox',
  subcommand: 'list-snoozed',
  description: 'Get snoozed emails.',
  examples: ['smartlead inbox list-snoozed'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/snoozed' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listSnoozedCommand, input, client),
};

const listImportantCommand: CommandDefinition = {
  name: 'inbox_list_important',
  group: 'inbox',
  subcommand: 'list-important',
  description: 'Get emails marked as important.',
  examples: ['smartlead inbox list-important'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/important' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listImportantCommand, input, client),
};

const listRemindersCommand: CommandDefinition = {
  name: 'inbox_list_reminders',
  group: 'inbox',
  subcommand: 'list-reminders',
  description: 'Get emails with active reminders.',
  examples: ['smartlead inbox list-reminders'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/reminders' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listRemindersCommand, input, client),
};

const listAssignedMeCommand: CommandDefinition = {
  name: 'inbox_list_assigned_me',
  group: 'inbox',
  subcommand: 'list-assigned-me',
  description: 'Get inbox emails assigned to the authenticated user.',
  examples: ['smartlead inbox list-assigned-me'],
  inputSchema: z.object({
    offset: z.coerce.number().optional().describe('Pagination offset'),
    limit: z.coerce.number().optional().describe('Results per page'),
    campaign_id: z.coerce.number().optional().describe('Filter by campaign ID'),
    client_id: z.coerce.number().optional().describe('Filter by client ID'),
  }),
  cliMappings: {
    options: [
      { field: 'offset', flags: '--offset <n>', description: 'Pagination offset' },
      { field: 'limit', flags: '--limit <n>', description: 'Results per page' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Filter by campaign' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/assigned-me' },
  fieldMappings: { offset: 'body', limit: 'body', campaign_id: 'body', client_id: 'body' },
  handler: (input, client) => executeCommand(listAssignedMeCommand, input, client),
};

const setReminderCommand: CommandDefinition = {
  name: 'inbox_set_reminder',
  group: 'inbox',
  subcommand: 'set-reminder',
  description: 'Set a reminder on a lead conversation.',
  examples: [
    'smartlead inbox set-reminder --lead-id 789 --campaign-id 456 --reminder-date "2024-02-01T09:00:00Z"',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    reminder_date: z.string().describe('Reminder datetime (ISO 8601)'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'reminder_date', flags: '--reminder-date <iso>', description: 'Reminder datetime (ISO 8601)' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/set-reminder' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', reminder_date: 'body' },
  handler: (input, client) => executeCommand(setReminderCommand, input, client),
};

const updateRevenueCommand: CommandDefinition = {
  name: 'inbox_update_revenue',
  group: 'inbox',
  subcommand: 'update-revenue',
  description: 'Update the revenue value associated with a lead (for pipeline tracking).',
  examples: [
    'smartlead inbox update-revenue --lead-id 789 --campaign-id 456 --revenue 5000',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    revenue: z.coerce.number().describe('Revenue value'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'revenue', flags: '--revenue <n>', description: 'Revenue value' },
    ],
  },
  endpoint: { method: 'PATCH', path: '/master-inbox/update-revenue' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', revenue: 'body' },
  handler: (input, client) => executeCommand(updateRevenueCommand, input, client),
};

const updateTeamMemberCommand: CommandDefinition = {
  name: 'inbox_update_team_member',
  group: 'inbox',
  subcommand: 'update-team-member',
  description: 'Assign or reassign a lead conversation to a team member.',
  examples: [
    'smartlead inbox update-team-member --lead-id 789 --campaign-id 456 --team-member-id 101',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    team_member_id: z.coerce.number().describe('Team member user ID to assign'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'team_member_id', flags: '--team-member-id <id>', description: 'Team member user ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/update-team-member' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', team_member_id: 'body' },
  handler: (input, client) => executeCommand(updateTeamMemberCommand, input, client),
};

const pushToSubsequenceCommand: CommandDefinition = {
  name: 'inbox_push_to_subsequence',
  group: 'inbox',
  subcommand: 'push-to-subsequence',
  description: 'Move a lead from a parent campaign into a subsequence (child campaign) from the inbox.',
  examples: [
    'smartlead inbox push-to-subsequence --lead-id 789 --campaign-id 456 --subsequence-id 999',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Current campaign ID'),
    subsequence_id: z.coerce.number().describe('Target subsequence campaign ID'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Current campaign ID' },
      { field: 'subsequence_id', flags: '--subsequence-id <id>', description: 'Target subsequence ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/push-to-subsequence' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', subsequence_id: 'body' },
  handler: (input, client) => executeCommand(pushToSubsequenceCommand, input, client),
};

const resumeLeadInboxCommand: CommandDefinition = {
  name: 'inbox_resume_lead',
  group: 'inbox',
  subcommand: 'resume-lead',
  description: 'Resume a paused lead from the inbox view.',
  examples: [
    'smartlead inbox resume-lead --lead-id 789 --campaign-id 456',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
    ],
  },
  endpoint: { method: 'PATCH', path: '/master-inbox/resume-lead' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body' },
  handler: (input, client) => executeCommand(resumeLeadInboxCommand, input, client),
};

const createNoteCommand: CommandDefinition = {
  name: 'inbox_create_note',
  group: 'inbox',
  subcommand: 'create-note',
  description: 'Create a note on a lead record.',
  examples: [
    'smartlead inbox create-note --lead-id 789 --campaign-id 456 --note "Called — left voicemail, follow up Friday"',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    note: z.string().describe('Note text content'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'note', flags: '--note <text>', description: 'Note text' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/create-note' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', note: 'body' },
  handler: (input, client) => executeCommand(createNoteCommand, input, client),
};

const createTaskCommand: CommandDefinition = {
  name: 'inbox_create_task',
  group: 'inbox',
  subcommand: 'create-task',
  description: 'Create a follow-up task for a lead.',
  examples: [
    'smartlead inbox create-task --lead-id 789 --campaign-id 456 --title "Send proposal" --due-date "2024-02-01"',
  ],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    campaign_id: z.coerce.number().describe('Campaign ID'),
    title: z.string().describe('Task title'),
    due_date: z.string().optional().describe('Due date (ISO 8601 or YYYY-MM-DD)'),
    description: z.string().optional().describe('Task description'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'title', flags: '--title <text>', description: 'Task title' },
      { field: 'due_date', flags: '--due-date <date>', description: 'Due date' },
      { field: 'description', flags: '--description <text>', description: 'Task description' },
    ],
  },
  endpoint: { method: 'POST', path: '/master-inbox/create-task' },
  fieldMappings: { lead_id: 'body', campaign_id: 'body', title: 'body', due_date: 'body', description: 'body' },
  handler: (input, client) => executeCommand(createTaskCommand, input, client),
};

const forwardReplyCommand: CommandDefinition = {
  name: 'inbox_forward_reply',
  group: 'inbox',
  subcommand: 'forward-reply',
  description: 'Forward a reply email thread to other recipients.',
  examples: [
    'smartlead inbox forward-reply --campaign-id 456 --lead-id 789 --to "manager@company.com" --email-stats-id 111',
  ],
  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    lead_id: z.coerce.number().describe('Lead ID'),
    to: z.string().describe('Recipient email address(es), comma-separated'),
    email_stats_id: z.coerce.number().describe('Email stats ID of the thread to forward'),
    note: z.string().optional().describe('Optional note to prepend to the forwarded email'),
  }),
  cliMappings: {
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID' },
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'to', flags: '--to <emails>', description: 'Recipient email(s)' },
      { field: 'email_stats_id', flags: '--email-stats-id <id>', description: 'Email stats ID' },
      { field: 'note', flags: '--note <text>', description: 'Note to prepend' },
    ],
  },
  endpoint: { method: 'POST', path: '/email-campaigns/forward-reply-email' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { to, ...rest } = input;
    return client.post('/email-campaigns/forward-reply-email', {
      ...rest,
      to: to.split(',').map((e: string) => e.trim()),
    });
  },
};

export const allInboxCommands: CommandDefinition[] = [
  // Thread history
  getMessageHistoryCommand,
  replyEmailCommand,
  forwardReplyCommand,
  // Unified inbox views
  listRepliesCommand,
  listUnreadCommand,
  getInboxItemCommand,
  listArchivedCommand,
  listSentCommand,
  listScheduledCommand,
  listSnoozedCommand,
  listImportantCommand,
  listRemindersCommand,
  listAssignedMeCommand,
  // Actions
  updateCategoryCommand,
  changeReadStatusCommand,
  setReminderCommand,
  updateRevenueCommand,
  updateTeamMemberCommand,
  pushToSubsequenceCommand,
  resumeLeadInboxCommand,
  createNoteCommand,
  createTaskCommand,
];
