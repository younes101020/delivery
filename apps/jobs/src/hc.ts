import { hc } from "hono/client";

import type { AppType } from "./app";

// assign the client to a variable to calculate the type when compiling
const client = hc<AppType>(""); // eslint-disable-line unused-imports/no-unused-vars
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args);
