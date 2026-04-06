const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createHubSpotMCPServer } = require('@hubspot/mcp-server');

async function main() {
  const server = await createHubSpotMCPServer({
    accessToken: process.env.HUBSPOT_TOKEN
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HubSpot MCP server draait');
}

main().catch(console.error);
