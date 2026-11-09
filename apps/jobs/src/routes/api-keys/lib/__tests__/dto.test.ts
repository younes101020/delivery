import { describe, expect, it } from "vitest";

import { API_KEY_SCOPES } from "@/lib/api-key-scopes";

import { createApiKeySchema } from "../dto";

describe("aPI key input validation", () => {
  it("requires a name and at least one valid scope", () => {
    expect(createApiKeySchema.safeParse({ name: "CI", scopes: ["applications:read"] }).success).toBe(true);
    expect(createApiKeySchema.safeParse({ name: "CI", scopes: [] }).success).toBe(false);
    expect(createApiKeySchema.safeParse({ name: "CI", scopes: ["users:write"] }).success).toBe(false);
    expect(createApiKeySchema.safeParse({ name: "CI", scopes: ["applications:read", "applications:read"] }).success).toBe(false);
  });

  it("keeps the selectable scope registry in sync with the input schema", () => {
    for (const scope of API_KEY_SCOPES) {
      expect(createApiKeySchema.safeParse({ name: "CI", scopes: [scope] }).success).toBe(true);
    }
  });
});
