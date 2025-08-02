import type { ZodTemplateLiteral } from "zod/v4";

import { faker } from "@faker-js/faker";
import { it as base } from "vitest";
import z from "zod/v4";

interface Fixtures {
  imageName: string;
  fullImageName: string;
  versionSchema: ZodTemplateLiteral<`${number}.${number}.${number}`>;
  imageDigestSchema: ZodTemplateLiteral<`sha256:${string}`>;
}

const versionSchema = z.templateLiteral([
  z.number(),
  ".",
  z.number(),
  ".",
  z.number(),
]);

const imageDigestSchema = z.templateLiteral([
  z.literal("sha256:"),
  z.string(),
]);

export const it = base.extend<Fixtures>({
  imageName: async ({}, use) => {
    const imageName = `${faker.word.sample()}:${faker.system.semver()}-latest`;
    await use(imageName);
  },
  fullImageName: async ({ imageName }, use) => {
    const fullImageName = `${imageName}@sha256:${faker.string.alphanumeric(64)}`;
    await use(fullImageName);
  },
  versionSchema: async ({}, use) => use(versionSchema),
  imageDigestSchema: async ({}, use) => use(imageDigestSchema),
});
