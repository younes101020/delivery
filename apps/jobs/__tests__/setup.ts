import { execSync } from "node:child_process";
import { beforeEach } from "vitest";

beforeEach(() => {
  execSync("yarn drizzle-kit push");
});
