import { type Queue, QueueEvents } from "bullmq";
import { HTTPException } from "hono/http-exception";
import Redis from "ioredis";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { ZodError } from "zod";

import { insertDeploymentSchema } from "@/db/dto";
import { DeploymentError } from "@/lib/error";
import { it } from "@/routes/deployments/__tests__/fixtures";
import { convertGitToAuthenticatedUrl, parseAppHost } from "@/routes/deployments/lib/tasks/deploy/jobs/utils";
import { connection, getBullConnection } from "@/routes/deployments/lib/tasks/utils";

import { waitForDeploymentToComplete } from "..";

const eventHandlers: Record<string, ({ jobId }: { jobId: string }) => void> = {};

vi.mock("bullmq", async (importOriginal) => {
  const actual = await importOriginal<typeof import("bullmq")>();

  const FlowProducer = vi.fn();
  FlowProducer.prototype.add = vi.fn();

  const QueueEvents = vi.fn();
  QueueEvents.prototype.on = vi.fn((event, handler) => {
    eventHandlers[event] = handler;
  });
  QueueEvents.prototype.removeAllListeners = vi.fn();
  QueueEvents.prototype.removeListener = vi.fn();

  const Job = {
    fromId: vi.fn().mockResolvedValue({ name: "configure" }),
  };

  return { ...actual, FlowProducer, QueueEvents, Job };
});

vi.mock("@/routes/deployments/lib/tasks", () => {
  const subscribeWorkerTo = vi.fn();
  return { subscribeWorkerTo };
});

describe("deployments related unit tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should format git URL to authenticated url", async ({ repoUrl, installationAuthenticationToken }) => {
    const authenticatedUrl = convertGitToAuthenticatedUrl(repoUrl, installationAuthenticationToken);
    const expectedUrl = `https://x-access-token:${installationAuthenticationToken}@${repoUrl.replace("git://", "")}`;

    expect(authenticatedUrl).toBe(expectedUrl);
  });

  it("should reject invalid port formats", () => {
    const invalidPorts = ["8080:80:90", "abc", "8080:abc", ":8080", "8080:", ""];

    invalidPorts.forEach((invalidPort) => {
      expect(() => insertDeploymentSchema.parse({
        repoUrl: "",
        githubAppId: 1,
        port: invalidPort,
      })).toThrow(ZodError);
    });
  });

  it("should append application name as hostname", () => {
    expect(parseAppHost("weatherapp", "https://younes.fr")).toBe("weatherapp.younes.fr");
  });

  it("should throw BUILD_APP_ERROR error for invalid host name URL", () => {
    try {
      parseAppHost("weatherapp", "invalid-hostname");
      expect(true).toBe(false);
    }
    catch (error) {
      if (error instanceof DeploymentError) {
        expect(error.name).toBe("BUILD_APP_ERROR");
      }
    }
  });

  it("should return cached redis connection if exists", () => {
    const connection1 = getBullConnection(connection);
    const connection2 = getBullConnection(connection);

    expect(connection1).toBe(connection2);
  });

  it("should return redis instance if redis is passed", () => {
    const connection1 = getBullConnection(connection);

    expect(connection1).toBeInstanceOf(Redis);
  });

  it("should resolve when the last deployment step is completed", async () => {
    const promise = waitForDeploymentToComplete("my-app", {} as Queue);

    eventHandlers.completed({ jobId: "123" });

    await expect(promise).resolves.toBeUndefined();
  });

  it("should reject after 15min with timeout http code", async () => {
    const promise = waitForDeploymentToComplete("my-app", {} as Queue);

    vi.advanceTimersByTime(900000);

    await expect(promise).rejects.toThrow(new HTTPException(408, { message: "Deployment timeout exceeded" }));
  });

  it("should call removeAllListeners when deployment failed due to timeout", async () => {
    const o = waitForDeploymentToComplete("my-app", {} as Queue);

    const queueEventsSpy = vi.spyOn(QueueEvents.prototype, "removeAllListeners");
    vi.advanceTimersByTime(900000);
    await expect(o).rejects.toThrowError();

    expect(queueEventsSpy).toBeCalledTimes(1);
  });
});
