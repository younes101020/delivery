import { execSync } from "node:child_process";

import env from "@/env";

export default async function setup() {
  if (env.NODE_ENV !== "test" || !env.BEARER_TOKEN) {
    throw new Error("NODE_ENV must be 'test' and bearer token too");
  }
  execSync("turbo run db:push --filter=@delivery/drizzle");
  execSync("turbo run db:seed --filter=@delivery/drizzle");
  
  return function teardown() {
    console.log("Teardown: Resetting database");
    execSync("turbo run db:reset --filter=@delivery/drizzle");
  };
}
