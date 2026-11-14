import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

interface ServerConfig {
  apiBaseUrl: string;
  bearerToken: string;
}

export function createMcpServer({ apiBaseUrl, bearerToken }: ServerConfig) {
  const server = new McpServer({
    name: "delivery",
    version: "1.0.0",
  });

  server.registerTool(
    "list_applications",
    {
      description: "List applications deployed on this Delivery instance.",
    },
    async () => {
      const response = await fetch(new URL("/applications", apiBaseUrl), {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok)
        throw new Error(`Failed to list applications: backend returned HTTP ${response.status}`);

      const applications: unknown = await response.json();

      if (!Array.isArray(applications))
        throw new Error("Failed to list applications: backend response was not a list");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(applications, null, 2),
          },
        ],
      };
    },
  );

  return server;
}
