import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const WEBHOOK_EVENTS = [
  'EMAIL_OPENED', 'EMAIL_CLICKED', 'EMAIL_REPLIED', 'EMAIL_BOUNCED',
  'LEAD_UNSUBSCRIBED', 'LEAD_CATEGORY_UPDATED', 'SEQUENCE_COMPLETED',
].join(', ');

const listCommand: CommandDefinition = {
  name: 'webhooks_list',
  group: 'webhooks',
  subcommand: 'list',
  description: 'List all webhooks in your account.',
  examples: ['smartlead webhooks list'],

  inputSchema: z.object({
    client_id: z.coerce.number().optional().describe('Filter by client sub-account ID'),
  }),

  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Filter by client ID' },
    ],
  },

  endpoint: { method: 'GET', path: '/webhooks' },
  fieldMappings: { client_id: 'query' },

  handler: (input, client) => executeCommand(listCommand, input, client),
};

const createCommand: CommandDefinition = {
  name: 'webhooks_create',
  group: 'webhooks',
  subcommand: 'create',
  description: `Create a webhook. Fires on campaign events and sends JSON to your URL.\n\nAvailable events: ${WEBHOOK_EVENTS}`,
  examples: [
    'smartlead webhooks create --name "Replies Hook" --url "https://example.com/hook" --events "EMAIL_REPLIED,EMAIL_BOUNCED"',
  ],

  inputSchema: z.object({
    name: z.string().describe('Webhook name'),
    url: z.string().describe('Webhook target URL (must be HTTPS)'),
    events: z.string().describe('Comma-separated event names to subscribe to'),
    client_id: z.coerce.number().optional().describe('Client sub-account ID'),
  }),

  cliMappings: {
    options: [
      { field: 'name', flags: '--name <name>', description: 'Webhook name' },
      { field: 'url', flags: '--url <url>', description: 'Webhook target URL' },
      { field: 'events', flags: '--events <list>', description: 'Comma-separated event names' },
      { field: 'client_id', flags: '--client-id <id>', description: 'Client sub-account ID' },
    ],
  },

  endpoint: { method: 'POST', path: '/webhooks' },
  fieldMappings: {},

  handler: async (input, client) => {
    const { events, ...rest } = input;
    return client.post('/webhooks', {
      ...rest,
      events: events.split(',').map((e: string) => e.trim()),
    });
  },
};

const updateCommand: CommandDefinition = {
  name: 'webhooks_update',
  group: 'webhooks',
  subcommand: 'update',
  description: 'Update an existing webhook.',
  examples: [
    'smartlead webhooks update <webhook_id> --url "https://example.com/new-hook"',
    'smartlead webhooks update <webhook_id> --events "EMAIL_REPLIED"',
  ],

  inputSchema: z.object({
    webhook_id: z.coerce.number().describe('Webhook ID'),
    name: z.string().optional().describe('Webhook name'),
    url: z.string().optional().describe('Webhook target URL'),
    events: z.string().optional().describe('Comma-separated event names (replaces all)'),
  }),

  cliMappings: {
    args: [{ field: 'webhook_id', name: 'webhook_id', required: true }],
    options: [
      { field: 'name', flags: '--name <name>', description: 'Webhook name' },
      { field: 'url', flags: '--url <url>', description: 'Webhook target URL' },
      { field: 'events', flags: '--events <list>', description: 'Comma-separated events' },
    ],
  },

  endpoint: { method: 'PATCH', path: '/webhooks/{webhook_id}' },
  fieldMappings: {},

  handler: async (input, client) => {
    const { webhook_id, events, ...rest } = input;
    const body: Record<string, any> = { ...rest };
    if (events) body.events = events.split(',').map((e: string) => e.trim());
    return client.patch(`/webhooks/${encodeURIComponent(webhook_id)}`, body);
  },
};

const deleteCommand: CommandDefinition = {
  name: 'webhooks_delete',
  group: 'webhooks',
  subcommand: 'delete',
  description: 'Delete a webhook.',
  examples: [
    'smartlead webhooks delete <webhook_id>',
  ],

  inputSchema: z.object({
    webhook_id: z.coerce.number().describe('Webhook ID'),
  }),

  cliMappings: {
    args: [{ field: 'webhook_id', name: 'webhook_id', required: true }],
  },

  endpoint: { method: 'DELETE', path: '/webhooks/{webhook_id}' },
  fieldMappings: { webhook_id: 'path' },

  handler: (input, client) => executeCommand(deleteCommand, input, client),
};

export const allWebhooksCommands: CommandDefinition[] = [
  listCommand,
  createCommand,
  updateCommand,
  deleteCommand,
];
