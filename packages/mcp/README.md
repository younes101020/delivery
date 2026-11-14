# @delivery/mcp

An MCP server for Delivery. It runs over stdio and currently exposes the
`list_applications` tool, which reads applications from the jobs API.

Set `JOBS_API_BASEURL` to the jobs API base URL and `JOBS_BEARER_TOKEN` to the
jobs API bearer token. Start the server with `pnpm --filter @delivery/mcp start`
after building the package, or use `pnpm --filter @delivery/mcp dev` during
development. Configure your MCP client to launch the package with these
environment variables.
