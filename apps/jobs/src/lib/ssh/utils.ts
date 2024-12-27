import { existsSync } from "node:fs";

export async function isContainerized() {
  return existsSync("/.dockerenv");
};
