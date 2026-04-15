import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allCommands } from '../commands/index.js';
import { resolveApiKey } from '../core/auth.js';
import { SmartleadClient } from '../core/client.js';
import { VERSION } from '../core/version.js';

export async function startMcpServer(): Promise<void> {
  const apiKey = await resolveApiKey();
  const client = new SmartleadClient({ apiKey });

  const server = new McpServer({
    name: 'smartlead',
    version: VERSION,
  });

  // Register every CommandDefinition as an MCP tool
  for (const cmdDef of allCommands) {
    const shape = cmdDef.inputSchema.shape;

    server.registerTool(
      cmdDef.name,
      {
        description: cmdDef.description,
        inputSchema: shape,
      },
      async (args: Record<string, unknown>) => {
        try {
          const result = await cmdDef.handler(args, client);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error: error.message ?? String(error),
                  code: error.code ?? 'UNKNOWN_ERROR',
                }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Smartlead MCP server started. Tools registered:', allCommands.length);
}
