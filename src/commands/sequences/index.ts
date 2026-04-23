import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const getCommand: CommandDefinition = {
  name: 'sequences_get',
  group: 'sequences',
  subcommand: 'get',
  description: 'Fetch all sequence steps for a campaign (with variants and delays).',
  examples: [
    'smartlead sequences get 456',
    'smartlead sequences get --campaign-id 456',
  ],

  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
  }),

  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: false }],
    options: [
      { field: 'campaign_id', flags: '--campaign-id <id>', description: 'Campaign ID (alternative to positional arg)' },
    ],
  },

  endpoint: { method: 'GET', path: '/campaigns/{campaign_id}/sequences' },
  fieldMappings: { campaign_id: 'path' },

  handler: (input, client) => executeCommand(getCommand, input, client),
};

/**
 * Normalize a single sequence step into the flat shape Smartlead's
 * `/campaigns/{id}/sequences` endpoint actually accepts.
 *
 * Smartlead's validator only allows these top-level keys on a step:
 *   id, seq_number, subject, email_body, seq_delay_details, seq_variants
 *
 * This helper accepts three input styles so callers can round-trip from
 * `sequences get` output or use the legacy nested-variants shape that the
 * CLI docs historically showed:
 *
 *   1. Native flat shape: passes through unchanged.
 *   2. camelCase delay (`delayInDays`): rewritten to `delay_in_days`.
 *   3. Nested `variants` array (A/B shape from the UI / `sequences get`):
 *      - 1 variant  → flattened onto the step (subject + email_body).
 *      - N variants → mapped to `seq_variants` with `variant_id` and
 *        `distribution` (evenly split unless the caller supplies one).
 */
function normalizeSequenceStep(raw: any, index: number): Record<string, any> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Each sequence step must be an object.');
  }

  const out: Record<string, any> = {};

  // Smartlead's reference explicitly shows `"id": null` for new steps — omitting
  // the key tripped the server's Joi validator in some accounts. Default to null
  // when the caller doesn't provide one.
  out.id = raw.id ?? null;
  out.seq_number = raw.seq_number ?? index + 1;

  const delayDetails = raw.seq_delay_details ?? {};
  const delayInDays =
    delayDetails.delay_in_days ?? delayDetails.delayInDays ?? raw.delay_in_days ?? raw.delayInDays ?? 0;
  out.seq_delay_details = { delay_in_days: Number(delayInDays) };

  const variants = Array.isArray(raw.variants)
    ? raw.variants
    : Array.isArray(raw.seq_variants)
      ? raw.seq_variants
      : null;

  if (!variants || variants.length === 0) {
    out.subject = raw.subject ?? '';
    out.email_body = raw.email_body ?? '';
    return out;
  }

  if (variants.length === 1) {
    const v = variants[0] ?? {};
    out.subject = v.subject ?? raw.subject ?? '';
    out.email_body = v.email_body ?? raw.email_body ?? '';
    return out;
  }

  const evenSplit = Math.floor(100 / variants.length);
  out.seq_variants = variants.map((v: any, idx: number) => ({
    variant_id: v.variant_id ?? v.variant_label ?? String.fromCharCode(65 + idx),
    subject: v.subject ?? '',
    email_body: v.email_body ?? '',
    distribution: Number(v.distribution ?? evenSplit),
  }));

  return out;
}

const saveCommand: CommandDefinition = {
  name: 'sequences_save',
  group: 'sequences',
  subcommand: 'save',
  description: `Save/replace the full sequence for a campaign. Replaces ALL existing steps.

Pause the campaign first — Smartlead refuses sequence edits while ACTIVE.

Each step is a flat object (matches Smartlead's public API):
[{
  "seq_number": 1,
  "subject": "Hello {{first_name}}",
  "email_body": "<p>Hi {{first_name}},</p>",
  "seq_delay_details": { "delay_in_days": 0 }
}]

For A/B testing, use seq_variants (2+ variants; distributions must sum to 100):
[{
  "seq_number": 1,
  "seq_delay_details": { "delay_in_days": 0 },
  "seq_variants": [
    { "variant_id": "A", "subject": "...", "email_body": "...", "distribution": 50 },
    { "variant_id": "B", "subject": "...", "email_body": "...", "distribution": 50 }
  ]
}]

For convenience, this command also accepts the nested shape returned by
\`sequences get\` (camelCase delays, a \`variants\` array with \`variant_label\`)
and normalizes it before sending.

Troubleshooting: run with SMARTLEAD_DEBUG=1 to log the exact request payload
being sent to Smartlead. Validation failures also include the outgoing body
in the error message to make contract mismatches obvious in E2E logs.`,
  examples: [
    'smartlead sequences save 456 --sequences \'[{"seq_number":1,"subject":"Hello","email_body":"<p>Hi</p>","seq_delay_details":{"delay_in_days":0}}]\'',
  ],

  inputSchema: z.object({
    campaign_id: z.coerce.number().describe('Campaign ID'),
    sequences: z.string().describe('JSON array of sequence step objects'),
  }),

  cliMappings: {
    args: [{ field: 'campaign_id', name: 'campaign_id', required: true }],
    options: [
      { field: 'sequences', flags: '--sequences <json>', description: 'JSON array of sequence steps' },
    ],
  },

  endpoint: { method: 'POST', path: '/campaigns/{campaign_id}/sequences' },
  fieldMappings: {},

  handler: async (input, client) => {
    const { campaign_id, sequences } = input;
    let parsed: any[];
    try {
      parsed = JSON.parse(sequences);
    } catch {
      throw new Error('Invalid --sequences JSON. Expected array of sequence step objects.');
    }
    if (!Array.isArray(parsed)) {
      // The user may have already wrapped their input as { sequences: [...] }.
      // Unwrap it rather than rejecting — makes the CLI forgiving of the shape
      // users copy/paste from the Smartlead API docs.
      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).sequences)) {
        parsed = (parsed as any).sequences;
      } else {
        throw new Error('--sequences must be a JSON array of step objects.');
      }
    }

    const normalized = parsed.map((step, idx) => normalizeSequenceStep(step, idx));
    try {
      return await client.post(
        `/campaigns/${encodeURIComponent(campaign_id)}/sequences`,
        { sequences: normalized },
      );
    } catch (err: any) {
      // Surface the outgoing payload on validation failures so E2E runs can
      // see exactly what the CLI sent to Smartlead vs. what the server rejected.
      if (err && (err.code === 'VALIDATION_ERROR' || err.statusCode === 400 || err.statusCode === 422)) {
        const payload = JSON.stringify({ sequences: normalized });
        err.message = `${err.message}\n  Sent: POST /campaigns/${campaign_id}/sequences body=${payload}`;
      }
      throw err;
    }
  },
};

export const allSequencesCommands: CommandDefinition[] = [getCommand, saveCommand];
