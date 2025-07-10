import { execSync } from "node:child_process";

import env from "@/env";

let teardownHappened = false;

export function setup() {
  if (env.NODE_ENV !== "test" || !env.BEARER_TOKEN) {
    throw new Error("NODE_ENV must be 'test' and bearer token too");
  }
  applyMigration();
  resetDatabase();
  seedDatabaseWithFakeData();
}

export function teardown() {
  if (teardownHappened) {
    throw new Error("teardown called twice");
  }
  teardownHappened = true;
  resetDatabase();
}

function applyMigration() {
  execSync("pnpm drizzle-kit push");
}

function seedDatabaseWithFakeData() {
  execSync("pnpm db:seed");
}

function resetDatabase() {
  execSync("pnpm db:reset");
}
