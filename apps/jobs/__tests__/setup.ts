import { execSync } from "node:child_process";

import env from "@/env";

let teardownHappened = false;

export function setup() {
  if (env.NODE_ENV !== "test" || !env.BEARER_TOKEN) {
    throw new Error("NODE_ENV must be 'test' and bearer token too");
  }
  setupTestDB();
}

export function teardown() {
  if (teardownHappened) {
    throw new Error("teardown called twice");
  }
  teardownHappened = true;
  resetDatabase();
}

function setupTestDB() {
  execSync("turbo run db:push db:reset db:seed --filter=@delivery/drizzle");
}

function resetDatabase() {
  execSync("turbo run db:reset --filter=@delivery/drizzle");
}
