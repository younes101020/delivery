import env from "@/env";

import { runTurboCommand } from "./utils";

export default async function setup() {
  if (env.NODE_ENV !== "test" || !env.BEARER_TOKEN) {
    throw new Error("NODE_ENV must be 'test' and bearer token too");
  }
  await runTurboCommand("db:push db:reset db:seed --filter=@delivery/drizzle");
}
