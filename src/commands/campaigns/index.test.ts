import { describe, expect, it } from 'vitest';
import { allCampaignsCommands } from './index.js';
import type { SmartleadClient } from '../../core/types.js';

const updateSettingsCommand = allCampaignsCommands.find(
  (command) => command.name === 'campaigns_update_settings',
);

function createClientSpy() {
  const calls: Array<{ path: string; body: unknown }> = [];
  const client = {
    post: async (path: string, body?: unknown) => {
      calls.push({ path, body });
      return { success: true };
    },
  } as SmartleadClient;

  return { client, calls };
}

describe('campaigns update-settings', () => {
  it('passes newer campaign settings fields and parses JSON CLI values', async () => {
    expect(updateSettingsCommand).toBeDefined();
    const { client, calls } = createClientSpy();

    await updateSettingsCommand!.handler(
      {
        campaign_id: 3252920,
        send_as_plain_text: true,
        force_plain_text: true,
        follow_up_percentage: 50,
        ai_categorisation_options: '["Interested","Not Interested"]',
        auto_pause_domain_leads_on_reply: true,
        ignore_ss_mailbox_sending_limit: true,
        domain_level_rate_limit: true,
        out_of_office_detection_settings: '{"enabled":true}',
      },
      client,
    );

    expect(calls).toEqual([
      {
        path: '/campaigns/3252920/settings',
        body: {
          send_as_plain_text: true,
          force_plain_text: true,
          follow_up_percentage: 50,
          auto_pause_domain_leads_on_reply: true,
          ignore_ss_mailbox_sending_limit: true,
          domain_level_rate_limit: true,
          ai_categorisation_options: ['Interested', 'Not Interested'],
          out_of_office_detection_settings: { enabled: true },
        },
      },
    ]);
  });

  it('accepts structured JSON values from MCP callers', async () => {
    expect(updateSettingsCommand).toBeDefined();
    const { client, calls } = createClientSpy();

    await updateSettingsCommand!.handler(
      {
        campaign_id: 123,
        ai_categorisation_options: ['Do Not Contact', 'Information Request'],
        out_of_office_detection_settings: { enabled: false },
      },
      client,
    );

    expect(calls[0].body).toMatchObject({
      ai_categorisation_options: ['Do Not Contact', 'Information Request'],
      out_of_office_detection_settings: { enabled: false },
    });
  });
});
