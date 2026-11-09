import { describe, expect, it } from "vitest";

import { getRequiredApiKeyScope } from "../api-key-auth";

describe("aPI key scope matching", () => {
  it("maps read and write requests to resource scopes", () => {
    expect(getRequiredApiKeyScope("GET", "/applications")).toBe("applications:read");
    expect(getRequiredApiKeyScope("POST", "/applications/demo/start")).toBe("applications:write");
    expect(getRequiredApiKeyScope("PATCH", "/serverconfig")).toBe("serverconfig:write");
  });

  it("denies resources and actions without a selectable scope", () => {
    expect(getRequiredApiKeyScope("GET", "/envvars")).toBeNull();
    expect(getRequiredApiKeyScope("GET", "/api-keys")).toBeNull();
    expect(getRequiredApiKeyScope("GET", "/users/1/team")).toBeNull();
    expect(getRequiredApiKeyScope("GET", "/unknown")).toBeNull();
  });
});
