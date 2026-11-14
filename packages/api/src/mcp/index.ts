export interface McpApiConfig {
  jobsApiBaseUrl: string;
  bearerToken: string;
  fetch?: typeof globalThis.fetch;
}

export function createMcpApi({ jobsApiBaseUrl, bearerToken, fetch: fetchImplementation = globalThis.fetch }: McpApiConfig) {
  return {
    async listApplications(): Promise<unknown[]> {
      const response = await fetchImplementation(new URL("/applications", jobsApiBaseUrl), {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok)
        throw new Error(`Failed to list applications: backend returned HTTP ${response.status}`);

      const applications: unknown = await response.json();

      if (!Array.isArray(applications))
        throw new TypeError("Failed to list applications: backend response was not a list");

      return applications;
    },
  };
}
