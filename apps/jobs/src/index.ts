import { serve } from "@hono/node-server";

import app from "./app";
import env from "./env";

const port = env.PORT;
// eslint-disable-next-line no-console
console.log(`
🚀 Delivery API is running on http://localhost:${port}
🗒️  API Docs available at: http://localhost:${port}/reference
`);

serve({
  fetch: app.fetch,
  port,
});
