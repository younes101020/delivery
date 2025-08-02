import type { ZodTemplateLiteral } from "zod/v4";

import { faker } from "@faker-js/faker";
import { it as base } from "vitest";
import z from "zod/v4";

interface Fixtures {
  tag: Tag;
  tagSchema: ZodTemplateLiteral<`${number}.${number}.${number}`>;
}

type Tag = `v${number}.${number}.${number}`;

const tagSchema = z.templateLiteral([
  z.number(),
  ".",
  z.number(),
  ".",
  z.number(),
]);

export const it = base.extend<Fixtures>({
  tag: async ({}, use) => {
    const tag = `v${faker.system.semver()}` as Tag;
    await use(tag);
  },
  tagSchema: async ({}, use) => use(tagSchema),
});
