import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const listClientsCommand: CommandDefinition = {
  name: 'clients_list',
  group: 'clients',
  subcommand: 'list',
  description: 'List all client sub-accounts (agency/white-label feature).',
  examples: ['smartlead clients list'],

  inputSchema: z.object({}),

  cliMappings: {},

  endpoint: { method: 'GET', path: '/client/' },
  fieldMappings: {},

  handler: (input, client) => executeCommand(listClientsCommand, input, client),
};

const saveClientCommand: CommandDefinition = {
  name: 'clients_save',
  group: 'clients',
  subcommand: 'save',
  description: 'Create or update a client sub-account. Omit id to create a new client.',
  examples: [
    'smartlead clients save --name "Acme Corp" --email "admin@acme.com" --password "securepass"',
    'smartlead clients save --id 123 --name "Acme Corp Updated"',
  ],

  inputSchema: z.object({
    id: z.coerce.number().optional().describe('Client ID (omit to create new)'),
    name: z.string().describe('Client name'),
    email: z.string().email().describe('Client email address'),
    password: z.string().optional().describe('Client account password'),
    logo: z.string().optional().describe('Logo file path or URL'),
    logo_url: z.string().optional().describe('Logo URL'),
    permission: z.string().optional().describe('JSON permissions object'),
    is_credit_assigned: z.boolean().optional().describe('Whether credits are assigned'),
    email_credits: z.coerce.number().optional().describe('Email credits to assign'),
    lead_credits: z.coerce.number().optional().describe('Lead credits to assign'),
  }),

  cliMappings: {
    options: [
      { field: 'id', flags: '--id <id>', description: 'Client ID (omit to create new)' },
      { field: 'name', flags: '--name <name>', description: 'Client name' },
      { field: 'email', flags: '--email <email>', description: 'Client email address' },
      { field: 'password', flags: '--password <pass>', description: 'Client password' },
      { field: 'logo', flags: '--logo <path>', description: 'Logo file or URL' },
      { field: 'logo_url', flags: '--logo-url <url>', description: 'Logo URL' },
      { field: 'is_credit_assigned', flags: '--assign-credits', description: 'Assign credits to client' },
      { field: 'email_credits', flags: '--email-credits <n>', description: 'Email credits' },
      { field: 'lead_credits', flags: '--lead-credits <n>', description: 'Lead credits' },
    ],
  },

  endpoint: { method: 'POST', path: '/client/save' },
  fieldMappings: {
    id: 'body',
    name: 'body',
    email: 'body',
    password: 'body',
    logo: 'body',
    logo_url: 'body',
    permission: 'body',
    is_credit_assigned: 'body',
    email_credits: 'body',
    lead_credits: 'body',
  },

  handler: (input, client) => executeCommand(saveClientCommand, input, client),
};

const listApiKeysCommand: CommandDefinition = {
  name: 'clients_list_api_keys',
  group: 'clients',
  subcommand: 'list-api-keys',
  description: 'List all API keys for client sub-accounts.',
  examples: [
    'smartlead clients list-api-keys',
    'smartlead clients list-api-keys --client-id 123',
    'smartlead clients list-api-keys --status active',
  ],

  inputSchema: z.object({
    clientId: z.coerce.number().optional().describe('Filter by client ID'),
    status: z.string().optional().describe('Filter by status (e.g., active, inactive)'),
    keyName: z.string().optional().describe('Filter by key name'),
  }),

  cliMappings: {
    options: [
      { field: 'clientId', flags: '--client-id <id>', description: 'Filter by client ID' },
      { field: 'status', flags: '--status <status>', description: 'Filter by status' },
      { field: 'keyName', flags: '--key-name <name>', description: 'Filter by key name' },
    ],
  },

  endpoint: { method: 'GET', path: '/client/api-key' },
  fieldMappings: {
    clientId: 'query',
    status: 'query',
    keyName: 'query',
  },

  handler: (input, client) => executeCommand(listApiKeysCommand, input, client),
};

const createApiKeyCommand: CommandDefinition = {
  name: 'clients_create_api_key',
  group: 'clients',
  subcommand: 'create-api-key',
  description: 'Generate a new API key for a client sub-account.',
  examples: [
    'smartlead clients create-api-key --client-id 123 --key-name "Production Key"',
  ],

  inputSchema: z.object({
    client_id: z.coerce.number().describe('Client ID'),
    key_name: z.string().describe('Name for the new API key'),
  }),

  cliMappings: {
    options: [
      { field: 'client_id', flags: '--client-id <id>', description: 'Client ID' },
      { field: 'key_name', flags: '--key-name <name>', description: 'Name for the API key' },
    ],
  },

  endpoint: { method: 'POST', path: '/client/api-key' },
  fieldMappings: {
    client_id: 'body',
    key_name: 'body',
  },

  handler: (input, client) => executeCommand(createApiKeyCommand, input, client),
};

const deleteApiKeyCommand: CommandDefinition = {
  name: 'clients_delete_api_key',
  group: 'clients',
  subcommand: 'delete-api-key',
  description: 'Delete a client API key by ID.',
  examples: [
    'smartlead clients delete-api-key <key_id>',
  ],

  inputSchema: z.object({
    id: z.coerce.number().describe('API key ID'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'DELETE', path: '/client/api-key/{id}' },
  fieldMappings: { id: 'path' },

  handler: (input, client) => executeCommand(deleteApiKeyCommand, input, client),
};

const resetApiKeyCommand: CommandDefinition = {
  name: 'clients_reset_api_key',
  group: 'clients',
  subcommand: 'reset-api-key',
  description: 'Reset/regenerate a client API key.',
  examples: [
    'smartlead clients reset-api-key <key_id>',
  ],

  inputSchema: z.object({
    id: z.coerce.number().describe('API key ID to reset'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'PUT', path: '/client/api-key/reset/{id}' },
  fieldMappings: { id: 'path' },

  handler: (input, client) => executeCommand(resetApiKeyCommand, input, client),
};

export const allClientsCommands: CommandDefinition[] = [
  listClientsCommand,
  saveClientCommand,
  listApiKeysCommand,
  createApiKeyCommand,
  deleteApiKeyCommand,
  resetApiKeyCommand,
];
