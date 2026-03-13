# smartlead-cli

CLI and MCP server for the [Smartlead.ai](https://smartlead.ai) API. Manage cold email campaigns, leads, email accounts, sequences, analytics, webhooks, and client sub-accounts from the terminal or from any AI agent via MCP.

## Install

```bash
npm install -g @bcharleson/smartlead-cli
```

## Authenticate

```bash
# Option 1: environment variable (recommended for agents and CI)
export SMARTLEAD_API_KEY="your_api_key_here"

# Option 2: interactive login (stores to ~/.smartlead-cli/config.json)
smartlead login

# Option 3: per-command flag
smartlead campaigns list --api-key "your_api_key_here"
```

Get your API key from **Smartlead → Settings → API Key**.

## Quick Start

```bash
# List all campaigns
smartlead campaigns list

# Create a campaign
smartlead campaigns create --name "Q1 Outreach"

# Add leads to a campaign
smartlead leads add-to-campaign --campaign-id 456 \
  --lead-list '[{"email":"ceo@acme.com","first_name":"John","company_name":"Acme"}]'

# Activate a campaign
smartlead campaigns update-status 456 --status ACTIVE

# Get campaign analytics
smartlead analytics campaign-stats --campaign-id 456
```

## MCP Setup (AI Agents)

Add to your MCP client config (e.g. `~/.claude.json` or Claude Desktop `settings.json`):

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

Or if installed globally:

```json
{
  "mcpServers": {
    "smartlead": {
      "command": "smartlead",
      "args": ["mcp"],
      "env": {
        "SMARTLEAD_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

All 41 CLI commands are available as MCP tools instantly. Tool names use snake_case: `campaigns_list`, `leads_add_to_campaign`, `analytics_overview`, etc.

## Output

All commands output compact JSON to stdout by default — ready for piping and agent parsing.

```bash
# Compact JSON (default)
smartlead campaigns list
# → [{"id":123,"name":"Q1 Outreach","status":"ACTIVE",...}]

# Pretty-printed
smartlead campaigns list --pretty

# Filter fields
smartlead campaigns list --fields id,name,status

# Suppress output (exit code only)
smartlead campaigns create --name "Test" --quiet
```

Errors go to stderr as JSON: `{"error":"...","code":"AUTH_ERROR"}`

Exit codes: `0` success · `1` error

## Commands

### `campaigns`

| Command | Description |
|---------|-------------|
| `list` | List all campaigns |
| `get <id>` | Get a campaign by ID |
| `create` | Create a campaign (starts in DRAFTED status) |
| `update-status <id>` | Set status: `ACTIVE`, `PAUSED`, `STOPPED` |
| `update-settings <id>` | Tracking, stop rules, unsubscribe text, AI ESP matching |
| `schedule <id>` | Timezone, days, hours, max leads/day |
| `delete <id>` | Delete a campaign (irreversible) |

```bash
smartlead campaigns create --name "Cold Outreach Q2"
smartlead campaigns schedule 456 \
  --timezone "America/New_York" \
  --days-of-week "[1,2,3,4,5]" \
  --start-hour "08:00" \
  --end-hour "17:00" \
  --max-leads-per-day 50
smartlead campaigns update-status 456 --status ACTIVE
```

### `sequences`

| Command | Description |
|---------|-------------|
| `get <campaign_id>` | Fetch all steps with variants and delays |
| `save <campaign_id>` | Replace entire sequence (all steps at once) |

```bash
smartlead sequences save 456 --sequences '[
  {
    "seq_number": 1,
    "seq_delay_details": {"delay_in_days": 0},
    "variant_distribution_type": "MANUAL_EQUAL",
    "variants": [{
      "subject": "Quick question, {{first_name}}",
      "email_body": "<p>Hi {{first_name}},</p><p>...</p>",
      "variant_label": "A"
    }]
  },
  {
    "seq_number": 2,
    "seq_delay_details": {"delay_in_days": 3},
    "variant_distribution_type": "MANUAL_EQUAL",
    "variants": [{
      "subject": "Following up",
      "email_body": "<p>Just checking in...</p>",
      "variant_label": "A"
    }]
  }
]'
```

> **Note:** `save` replaces the full sequence. Always send all steps.

### `email-accounts`

| Command | Description |
|---------|-------------|
| `list` | List all email accounts |
| `get <id>` | Get an account by ID |
| `create` | Add SMTP/IMAP account |
| `update <id>` | Update account settings |
| `update-warmup <id>` | Configure warmup (enable, daily volume, ramp-up) |
| `warmup-stats <id>` | Last 7 days warmup stats |
| `list-campaign` | List accounts for a campaign |
| `add-to-campaign` | Assign account to campaign |
| `remove-from-campaign` | Remove account from campaign |

```bash
smartlead email-accounts create \
  --from-name "John Smith" \
  --from-email "john@yourdomain.com" \
  --username "john@yourdomain.com" \
  --password "app_password" \
  --smtp-host "smtp.gmail.com" \
  --smtp-port 587 \
  --imap-host "imap.gmail.com" \
  --imap-port 993

smartlead email-accounts add-to-campaign --campaign-id 456 --account-id 789
smartlead email-accounts update-warmup 789 --warmup-enabled --total-warmup-per-day 20 --daily-rampup 2
```

### `leads`

| Command | Description |
|---------|-------------|
| `get-by-email` | Find lead by email across all campaigns |
| `list-campaign` | List leads in a campaign (paginated) |
| `add-to-campaign` | Add leads JSON array to a campaign |
| `update` | Update lead fields |
| `pause` | Pause sending to a lead |
| `resume` | Resume a paused lead |
| `unsubscribe-campaign` | Unsubscribe from one campaign |
| `unsubscribe-global` | Globally unsubscribe (all campaigns) |
| `delete` | Delete lead from campaign |
| `get-campaigns` | Get all campaigns a lead is in |
| `add-domain-block` | Block an entire domain |
| `export` | Export leads as CSV |

```bash
# Add multiple leads at once
smartlead leads add-to-campaign --campaign-id 456 --lead-list '[
  {"email":"ceo@acme.com","first_name":"John","last_name":"Smith","company_name":"Acme Corp"},
  {"email":"vp@globex.com","first_name":"Jane","company_name":"Globex"}
]'

# Pause a lead
smartlead leads pause --campaign-id 456 --lead-id 789

# Block a domain
smartlead leads add-domain-block --domain "competitor.com"
```

Template variables in sequences: `{{first_name}}`, `{{last_name}}`, `{{company_name}}`, `{{email}}`, `{{custom_field_name}}`

### `inbox`

| Command | Description |
|---------|-------------|
| `message-history` | Full email thread for a lead in a campaign |
| `reply` | Reply to a lead via the Master Inbox |

```bash
smartlead inbox message-history --campaign-id 456 --lead-id 789
smartlead inbox reply \
  --campaign-id 456 \
  --lead-id 789 \
  --email-body "<p>Thanks for your reply! Let's connect.</p>" \
  --email-stats-id 111 \
  --reply-message-id "abc123@mail.gmail.com"
```

### `analytics`

| Command | Description |
|---------|-------------|
| `campaign-stats` | Opens, clicks, replies, bounces summary |
| `campaign-analytics` | Top-level performance metrics |
| `campaign-analytics-by-date` | Time-series data by date range |
| `lead-stats` | Lead funnel: interested, in progress, completed, etc. |
| `overview` | Global analytics across all campaigns |

```bash
smartlead analytics campaign-stats --campaign-id 456
smartlead analytics campaign-analytics-by-date \
  --campaign-id 456 \
  --start-date "2024-01-01" \
  --end-date "2024-01-31"
smartlead analytics overview --pretty
```

### `webhooks`

| Command | Description |
|---------|-------------|
| `list` | List all webhooks |
| `create` | Create a webhook |
| `update <id>` | Update a webhook |
| `delete <id>` | Delete a webhook |

```bash
smartlead webhooks create \
  --name "Reply Notifications" \
  --url "https://your-server.com/hook" \
  --events "EMAIL_REPLIED,EMAIL_BOUNCED,LEAD_UNSUBSCRIBED"
```

Available events: `EMAIL_OPENED`, `EMAIL_CLICKED`, `EMAIL_REPLIED`, `EMAIL_BOUNCED`, `LEAD_UNSUBSCRIBED`, `LEAD_CATEGORY_UPDATED`, `SEQUENCE_COMPLETED`

### `clients` (agency/white-label)

| Command | Description |
|---------|-------------|
| `list` | List all client sub-accounts |
| `save` | Create or update a client |
| `list-api-keys` | List client API keys |
| `create-api-key` | Generate a new API key |
| `delete-api-key <id>` | Delete an API key |
| `reset-api-key <id>` | Regenerate an API key |

```bash
smartlead clients save \
  --name "Acme Corp" \
  --email "admin@acme.com" \
  --password "securepass123"

smartlead clients create-api-key --client-id 123 --key-name "Production"
```

## Full Campaign Launch Workflow

```bash
# 1. Create campaign
CAMPAIGN=$(smartlead campaigns create --name "Q2 Outreach" | jq -r '.id')

# 2. Schedule
smartlead campaigns schedule $CAMPAIGN \
  --timezone "America/Chicago" \
  --days-of-week "[1,2,3,4,5]" \
  --start-hour "09:00" \
  --end-hour "17:00" \
  --max-leads-per-day 40 \
  --min-time-between-emails 15

# 3. Configure settings
smartlead campaigns update-settings $CAMPAIGN \
  --track-settings '["DONT_LINK_CLICK"]' \
  --unsubscribe-text "Unsubscribe"

# 4. Assign email account
smartlead email-accounts add-to-campaign \
  --campaign-id $CAMPAIGN --account-id 789

# 5. Save sequence
smartlead sequences save $CAMPAIGN --sequences '[
  {"seq_number":1,"seq_delay_details":{"delay_in_days":0},"variant_distribution_type":"MANUAL_EQUAL","variants":[{"subject":"{{first_name}}, quick thought on {{company_name}}","email_body":"<p>Hi {{first_name}},</p><p>Noticed {{company_name}} is...</p>","variant_label":"A"}]},
  {"seq_number":2,"seq_delay_details":{"delay_in_days":3},"variant_distribution_type":"MANUAL_EQUAL","variants":[{"subject":"Re: {{first_name}}, quick thought on {{company_name}}","email_body":"<p>Wanted to follow up...</p>","variant_label":"A"}]},
  {"seq_number":3,"seq_delay_details":{"delay_in_days":5},"variant_distribution_type":"MANUAL_EQUAL","variants":[{"subject":"Last touch","email_body":"<p>I'll leave you alone after this...</p>","variant_label":"A"}]}
]'

# 6. Import leads
smartlead leads add-to-campaign --campaign-id $CAMPAIGN \
  --lead-list '[{"email":"ceo@target.com","first_name":"Sarah","company_name":"Target Co"}]'

# 7. Launch
smartlead campaigns update-status $CAMPAIGN --status ACTIVE

# 8. Monitor
smartlead analytics campaign-stats --campaign-id $CAMPAIGN --pretty
```

## API Reference

- Base URL: `https://server.smartlead.ai/api/v1`
- Auth: `?api_key=<key>` query param (auto-injected)
- Rate limit: 10 requests / 2 seconds (auto-retried with backoff)
- Full docs: [api.smartlead.ai](https://api.smartlead.ai)

## License

MIT
