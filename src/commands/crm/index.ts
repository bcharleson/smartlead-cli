import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const listLeadTagsCommand: CommandDefinition = {
  name: 'crm_list_lead_tags',
  group: 'crm',
  subcommand: 'list-lead-tags',
  description: 'List all tags assigned to a lead.',
  examples: ['smartlead crm list-lead-tags --lead-id 789'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [{ field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' }],
  },
  endpoint: { method: 'GET', path: '/crm/leads/tags' },
  fieldMappings: { lead_id: 'query' },
  handler: (input, client) => executeCommand(listLeadTagsCommand, input, client),
};

const addLeadTagsCommand: CommandDefinition = {
  name: 'crm_add_lead_tags',
  group: 'crm',
  subcommand: 'add-lead-tags',
  description: 'Add tags to a lead.',
  examples: ['smartlead crm add-lead-tags --lead-id 789 --tag-ids \'[1,2,3]\''],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    tag_ids: z.string().describe('JSON array of tag IDs to add'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'tag_ids', flags: '--tag-ids <json>', description: 'JSON array of tag IDs' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/leads/tags' },
  fieldMappings: {},
  handler: async (input, client) => {
    const { lead_id, tag_ids } = input;
    let tagIds: number[];
    try { tagIds = JSON.parse(tag_ids); }
    catch { throw new Error('Invalid --tag-ids JSON. Expected array of numbers.'); }
    return client.post('/crm/leads/tags', { lead_id, tag_ids: tagIds });
  },
};

const removeLeadTagCommand: CommandDefinition = {
  name: 'crm_remove_lead_tag',
  group: 'crm',
  subcommand: 'remove-lead-tag',
  description: 'Remove a tag from a lead by tag mapping ID.',
  examples: ['smartlead crm remove-lead-tag --tag-mapping-id 42'],
  inputSchema: z.object({
    tagMappingId: z.coerce.number().describe('Tag mapping ID to delete'),
  }),
  cliMappings: {
    options: [{ field: 'tagMappingId', flags: '--tag-mapping-id <id>', description: 'Tag mapping ID' }],
  },
  endpoint: { method: 'DELETE', path: '/crm/leads/tags/{tagMappingId}' },
  fieldMappings: { tagMappingId: 'path' },
  handler: (input, client) => executeCommand(removeLeadTagCommand, input, client),
};

const listLeadNotesCommand: CommandDefinition = {
  name: 'crm_list_lead_notes',
  group: 'crm',
  subcommand: 'list-lead-notes',
  description: 'Get all notes for a lead.',
  examples: ['smartlead crm list-lead-notes --lead-id 789'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [{ field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' }],
  },
  endpoint: { method: 'GET', path: '/crm/leads/notes/{lead_id}' },
  fieldMappings: { lead_id: 'path' },
  handler: (input, client) => executeCommand(listLeadNotesCommand, input, client),
};

const createLeadNoteCommand: CommandDefinition = {
  name: 'crm_create_lead_note',
  group: 'crm',
  subcommand: 'create-lead-note',
  description: 'Create a note for a lead.',
  examples: ['smartlead crm create-lead-note --lead-id 789 --note "Follow up next week"'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    note: z.string().describe('Note text content'),
    campaign_id: z.coerce.number().optional().describe('Associated campaign ID'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'note', flags: '--note <text>', description: 'Note text' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID (optional)' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/leads/notes' },
  fieldMappings: { lead_id: 'body', note: 'body', campaign_id: 'body' },
  handler: (input, client) => executeCommand(createLeadNoteCommand, input, client),
};

const listLeadTasksCommand: CommandDefinition = {
  name: 'crm_list_lead_tasks',
  group: 'crm',
  subcommand: 'list-lead-tasks',
  description: 'Get all tasks for a lead.',
  examples: ['smartlead crm list-lead-tasks --lead-id 789'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
  }),
  cliMappings: {
    options: [{ field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' }],
  },
  endpoint: { method: 'GET', path: '/crm/leads/tasks/{lead_id}' },
  fieldMappings: { lead_id: 'path' },
  handler: (input, client) => executeCommand(listLeadTasksCommand, input, client),
};

const createLeadTaskCommand: CommandDefinition = {
  name: 'crm_create_lead_task',
  group: 'crm',
  subcommand: 'create-lead-task',
  description: 'Create a task for a lead.',
  examples: ['smartlead crm create-lead-task --lead-id 789 --task "Send LinkedIn connection" --due-date "2024-12-31"'],
  inputSchema: z.object({
    lead_id: z.coerce.number().describe('Lead ID'),
    task: z.string().describe('Task description'),
    due_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    campaign_id: z.coerce.number().optional().describe('Associated campaign ID'),
    assignee_id: z.coerce.number().optional().describe('Assignee user ID'),
  }),
  cliMappings: {
    options: [
      { field: 'lead_id', flags: '--lead-id <id>', description: 'Lead ID' },
      { field: 'task', flags: '--task <text>', description: 'Task description' },
      { field: 'due_date', flags: '--due-date <date>', description: 'Due date (YYYY-MM-DD)' },
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID (optional)' },
      { field: 'assignee_id', flags: '--assignee-id <id>', description: 'Assignee user ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/leads/tasks' },
  fieldMappings: { lead_id: 'body', task: 'body', due_date: 'body', campaign_id: 'body', assignee_id: 'body' },
  handler: (input, client) => executeCommand(createLeadTaskCommand, input, client),
};

const updateLeadTaskCommand: CommandDefinition = {
  name: 'crm_update_lead_task',
  group: 'crm',
  subcommand: 'update-lead-task',
  description: 'Update a lead task status or details.',
  examples: ['smartlead crm update-lead-task --task-id 55 --status completed'],
  inputSchema: z.object({
    task_id: z.coerce.number().describe('Task ID'),
    task: z.string().optional().describe('Task description'),
    due_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    status: z.enum(['pending', 'completed', 'cancelled']).optional().describe('Task status'),
    assignee_id: z.coerce.number().optional().describe('Assignee user ID'),
  }),
  cliMappings: {
    options: [
      { field: 'task_id', flags: '--task-id <id>', description: 'Task ID' },
      { field: 'task', flags: '--task <text>', description: 'Task description' },
      { field: 'due_date', flags: '--due-date <date>', description: 'Due date (YYYY-MM-DD)' },
      { field: 'status', flags: '--status <status>', description: 'Status: pending, completed, cancelled' },
      { field: 'assignee_id', flags: '--assignee-id <id>', description: 'Assignee user ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/leads/tasks/{task_id}' },
  fieldMappings: { task_id: 'path', task: 'body', due_date: 'body', status: 'body', assignee_id: 'body' },
  handler: (input, client) => executeCommand(updateLeadTaskCommand, input, client),
};

const listTagsCommand: CommandDefinition = {
  name: 'crm_list_tags',
  group: 'crm',
  subcommand: 'list-tags',
  description: 'List all available CRM tags in the account.',
  examples: ['smartlead crm list-tags'],
  inputSchema: z.object({}),
  cliMappings: { options: [] },
  endpoint: { method: 'GET', path: '/crm/tags' },
  fieldMappings: {},
  handler: (input, client) => executeCommand(listTagsCommand, input, client),
};

const createTagCommand: CommandDefinition = {
  name: 'crm_create_tag',
  group: 'crm',
  subcommand: 'create-tag',
  description: 'Create a new CRM tag.',
  examples: ['smartlead crm create-tag --name "Hot Lead" --color "#FF5733"'],
  inputSchema: z.object({
    name: z.string().describe('Tag name'),
    color: z.string().optional().describe('Tag color (hex, e.g., #FF5733)'),
  }),
  cliMappings: {
    options: [
      { field: 'name', flags: '--name <name>', description: 'Tag name' },
      { field: 'color', flags: '--color <hex>', description: 'Tag color (hex)' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/tags' },
  fieldMappings: { name: 'body', color: 'body' },
  handler: (input, client) => executeCommand(createTagCommand, input, client),
};

export const allCrmCommands: CommandDefinition[] = [
  listLeadTagsCommand,
  addLeadTagsCommand,
  removeLeadTagCommand,
  listLeadNotesCommand,
  createLeadNoteCommand,
  listLeadTasksCommand,
  createLeadTaskCommand,
  updateLeadTaskCommand,
  listTagsCommand,
  createTagCommand,
];
