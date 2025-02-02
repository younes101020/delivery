import { execSync } from "node:child_process";

import env from "@/env";

let teardownHappened = false;

export function setup() {
  if (env.NODE_ENV !== "test" || !env.BEARER_TOKEN) {
    throw new Error("NODE_ENV must be 'test' and bearer token too");
  }
  applyMigration();
  seedDatabaseWithFakeData();
  execSync("yarn db:temp:fix");
}

export function teardown() {
  if (teardownHappened) {
    throw new Error("teardown called twice");
  }
  teardownHappened = true;
  resetDatabase();
}

function applyMigration() {
  execSync("yarn drizzle-kit push");
}

function seedDatabaseWithFakeData() {
  execSync("yarn db:seed");
}

function resetDatabase() {
  execSync("yarn db:reset");
}
