/* eslint-disable node/no-process-env */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createMcpServer } from "./server.js";

const apiBaseUrl = process.env.JOBS_API_BASEURL;
const bearerToken = process.env.JOBS_BEARER_TOKEN;

if (!apiBaseUrl || !bearerToken)
  throw new Error("JOBS_API_BASEURL and JOBS_BEARER_TOKEN must be configured");

const server = createMcpServer({ apiBaseUrl, bearerToken });
await server.connect(new StdioServerTransport());
