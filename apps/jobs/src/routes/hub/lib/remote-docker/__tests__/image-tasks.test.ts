import { describe, expect, it, vi } from "vitest";

import { pullImage } from "../image-tasks";

const docker = vi.hoisted(() => ({
  modem: {
    followProgress: vi.fn(),
  },
  pull: vi.fn(),
}));

vi.mock("@/lib/remote-docker/middleware", () => ({
  withDocker: (task: (instance: typeof docker, input?: unknown) => Promise<unknown>) => async (input?: unknown) => task(docker, input),
}));

describe("pullImage", () => {
  it("waits for Docker to finish pulling the image", async () => {
    const stream = {} as NodeJS.ReadableStream;
    docker.pull.mockResolvedValue(stream);
    docker.modem.followProgress.mockImplementation((_stream, onFinished) => onFinished(null, []));

    await pullImage({ image: "nginx" });

    expect(docker.pull).toHaveBeenCalledWith("nginx");
    expect(docker.modem.followProgress).toHaveBeenCalledWith(stream, expect.any(Function));
  });

  it("rejects when Docker reports a pull failure", async () => {
    docker.pull.mockResolvedValue({} as NodeJS.ReadableStream);
    docker.modem.followProgress.mockImplementation((_stream, onFinished) => onFinished(new Error("image not found"), []));

    await expect(pullImage({ image: "missing" })).rejects.toThrow("image not found");
  });
});
