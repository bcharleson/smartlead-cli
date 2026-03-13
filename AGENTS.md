# Smartlead CLI — AI Agent Guide

> This file helps AI agents (Claude, GPT, Gemini, OpenClaw) use `smartlead-cli` to fully manage Smartlead.ai campaigns, leads, email accounts, sequences, analytics, webhooks, and client sub-accounts via CLI or MCP.

## Quick Start

```bash
npm install -g @bcharleson/smartlead-cli
export SMARTLEAD_API_KEY="your_api_key_here"
smartlead campaigns list
```

## Authentication

3-tier resolution (highest priority first):
1. `--api-key <key>` flag (per-command override)
2. `SMARTLEAD_API_KEY` environment variable (recommended for agents)
3. Stored config from `~/.smartlead-cli/config.json` (set via `smartlead login`)

**Note:** Smartlead uses an API key as a query parameter — not a Bearer token. The client handles injection automatically.

**Rate limit:** 10 requests per 2 seconds. The client auto-retries 429s with backoff.

## Output Format

All commands output **JSON to stdout** by default — ready for parsing:

```bash
# Default: compact JSON (agent-optimized)
smartlead campaigns list
# → [{"id":123,"name":"Q1 Outreach","status":"ACTIVE",...}]

# Pretty-printed JSON
smartlead campaigns list --pretty

# Select specific fields
smartlead campaigns list --fields id,name,status

# Suppress output (exit code only)
smartlead campaigns create --name "Test" --quiet
```

Exit codes: `0` = success, `1` = error. Errors go to stderr as JSON:
```json
{"error":"No API key found...","code":"AUTH_ERROR"}
```

## All Commands

### campaigns (7 commands)
- `list` — List all campaigns (`--client-id`, `--include-tags`)
- `get <campaign_id>` — Get a campaign by ID
- `create` — Create a campaign (`--name` required, `--client-id` optional)
- `update-status <campaign_id>` — Set status: `ACTIVE`, `PAUSED`, `STOPPED`
- `update-settings <campaign_id>` — Track opens/clicks, stop rules, unsubscribe text
- `schedule <campaign_id>` — Set timezone, days, hours, max leads/day
- `delete <campaign_id>` — Delete campaign (irreversible)

### sequences (2 commands)
- `get <campaign_id>` — Get all sequence steps with variants and delays
- `save <campaign_id>` — Replace entire sequence (`--sequences` JSON array)

### email-accounts (9 commands)
- `list` — List all email accounts (`--offset`, `--limit`)
- `get <email_account_id>` — Get an account by ID
- `create` — Add SMTP/IMAP account (`--from-name`, `--from-email`, `--smtp-host`, etc.)
- `update <email_account_id>` — Update account settings
- `update-warmup <email_account_id>` — Configure warmup (`--warmup-enabled`, `--total-warmup-per-day`, etc.)
- `warmup-stats <email_account_id>` — Get last 7 days warmup stats
- `list-campaign` — List accounts for a campaign (`--campaign-id`)
- `add-to-campaign` — Assign account to campaign (`--campaign-id`, `--account-id`)
- `remove-from-campaign` — Remove account from campaign

### leads (12 commands)
- `get-by-email` — Find lead by email (`--email`)
- `list-campaign` — List leads in a campaign (`--campaign-id`, `--offset`, `--limit`)
- `add-to-campaign` — Add leads JSON array to campaign (`--campaign-id`, `--lead-list`)
- `update` — Update lead fields (`--campaign-id`, `--lead-id`, `--first-name`, etc.)
- `pause` — Pause lead in campaign (`--campaign-id`, `--lead-id`)
- `resume` — Resume paused lead (`--campaign-id`, `--lead-id`)
- `unsubscribe-campaign` — Unsubscribe from one campaign
- `unsubscribe-global` — Globally unsubscribe a lead (`--lead-id`)
- `delete` — Delete lead from campaign
- `get-campaigns` — Get all campaigns a lead is in (`--lead-id`)
- `add-domain-block` — Add domain to global block list (`--domain`)
- `export` — Export leads as CSV (`--campaign-id`)

### inbox (2 commands)
- `message-history` — Get full email thread (`--campaign-id`, `--lead-id`)
- `reply` — Reply to a lead thread (`--campaign-id`, `--lead-id`, `--email-body`, `--email-stats-id`, `--reply-message-id`)

### analytics (5 commands)
- `campaign-stats` — Summary stats: opens, clicks, replies, bounces (`--campaign-id`)
- `campaign-analytics` — Top-level performance metrics (`--campaign-id`)
- `campaign-analytics-by-date` — Time-series data (`--campaign-id`, `--start-date`, `--end-date`)
- `lead-stats` — Lead funnel stats for a campaign (`--campaign-id`)
- `overview` — Global analytics across all campaigns (`--client-id`, `--start-date`, `--end-date`)

### webhooks (4 commands)
- `list` — List all webhooks
- `create` — Create webhook (`--name`, `--url`, `--events`)
- `update <webhook_id>` — Update webhook
- `delete <webhook_id>` — Delete webhook

### clients (6 commands — agency/white-label)
- `list` — List all client sub-accounts
- `save` — Create or update client (`--name`, `--email`, `--password`)
- `list-api-keys` — List client API keys
- `create-api-key` — Generate new API key (`--client-id`, `--key-name`)
- `delete-api-key <key_id>` — Delete a key
- `reset-api-key <key_id>` — Regenerate a key

## Common Workflow (Agents)

### Launch a campaign end-to-end:
```bash
# 1. Create campaign
smartlead campaigns create --name "Q1 Outreach" --pretty

# 2. Set schedule
smartlead campaigns schedule 456 --timezone "America/New_York" \
  --days-of-week "[1,2,3,4,5]" --start-hour "08:00" --end-hour "17:00" \
  --max-leads-per-day 50

# 3. Add email account
smartlead email-accounts add-to-campaign --campaign-id 456 --account-id 789

# 4. Save sequence
smartlead sequences save 456 --sequences '[
  {"seq_number":1,"seq_delay_details":{"delay_in_days":0},"variant_distribution_type":"MANUAL_EQUAL","variants":[{"subject":"{{first_name}}, quick question","email_body":"<p>Hi {{first_name}},</p><p>...</p>","variant_label":"A"}]},
  {"seq_number":2,"seq_delay_details":{"delay_in_days":3},"variant_distribution_type":"MANUAL_EQUAL","variants":[{"subject":"Re: {{first_name}}, quick question","email_body":"<p>Just following up...</p>","variant_label":"A"}]}
]'

# 5. Add leads
smartlead leads add-to-campaign --campaign-id 456 \
  --lead-list '[{"email":"ceo@acme.com","first_name":"John","last_name":"Smith","company_name":"Acme Corp"}]'

# 6. Activate
smartlead campaigns update-status 456 --status ACTIVE
```

## MCP Usage (Claude, OpenClaw, etc.)

Add to your MCP client config (e.g., `~/.claude/settings.json`):
```json
{
  "mcpServers": {
    "smartlead": {
      "command": "node",
      "args": ["/path/to/smartlead-cli/dist/mcp.js"],
      "env": {
        "SMARTLEAD_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Or using npx after publishing:
```json
{
  "mcpServers": {
    "smartlead": {
      "command": "npx",
      "args": ["-y", "@bcharleson/smartlead-cli", "mcp"],
      "env": {
        "SMARTLEAD_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Every CLI command becomes an MCP tool with identical behavior. Tool names use snake_case:
`campaigns_list`, `leads_add_to_campaign`, `email_accounts_update_warmup`, etc.

## Variable Substitution in Smartlead

Sequence email bodies support these template variables:
- `{{first_name}}` — Lead's first name
- `{{last_name}}` — Lead's last name
- `{{company_name}}` — Lead's company
- `{{email}}` — Lead's email
- `{{phone_number}}` — Lead's phone
- `{{website}}` — Lead's website
- `{{custom_field_name}}` — Any custom field set on the lead

## Key API Facts

- Base URL: `https://server.smartlead.ai/api/v1`
- Auth: `?api_key=<key>` query param on every request (auto-injected by client)
- Rate limit: 10 requests / 2 seconds (client retries 429s automatically)
- Campaign starts in `DRAFTED` status — must set to `ACTIVE` to start sending
- `sequences save` **replaces** all steps — always send the complete array
- Lead import uses `lead_list` array — up to 100 leads recommended per call
