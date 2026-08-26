import { afterEach, describe, expect, it, vi } from "vitest";

import { pullDockerImage } from "../pull-docker-image";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pull docker image", () => {
  it("returns the Docker pull failure message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "scratch is a reserved name" }), { status: 422 })));

    await expect(pullDockerImage("scratch")).rejects.toThrow("scratch is a reserved name");
  });

  it("resolves after a successful image pull", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));

    await expect(pullDockerImage("nginx")).resolves.toBeUndefined();
  });
});
