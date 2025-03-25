import { QueueEvents, type Queue as TQueue } from "bullmq";
import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { ZodError } from "zod";

import { insertDeploymentSchema } from "@/db/dto";
import { DeploymentError } from "@/lib/error";
import { it } from "@/routes/deployments/__tests__/fixtures";
import { convertGitToAuthenticatedUrl, parseAppHost, persistedEnvVarsToCmdEnvVars, plainEnvVarsToGroupedEnvVars, plainEnvVarsToPersistedEnvVars, waitForDeploymentToComplete } from "@/routes/deployments/lib/tasks/deploy/utils";

const eventHandlers: Record<string, ({ jobId }: { jobId: string }) => void> = {};

vi.mock("bullmq", async (importOriginal) => {
  const actual = await importOriginal<typeof import("bullmq")>();
  const QueueEvents = vi.fn();
  QueueEvents.prototype.on = vi.fn((event, handler) => {
    eventHandlers[event] = handler;
  });
  QueueEvents.prototype.removeAllListeners = vi.fn();
  QueueEvents.prototype.removeListener = vi.fn();
  const Job = {
    fromId: vi.fn().mockResolvedValue({ name: "configure" }),
  };

  return { ...actual, QueueEvents, Job };
});

describe("deployments utils unit tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  it("format git URL to authenticated url", async ({ repoUrl, installationAuthenticationToken }) => {
    const authenticatedUrl = convertGitToAuthenticatedUrl(repoUrl, installationAuthenticationToken);
    const expectedUrl = `https://x-access-token:${installationAuthenticationToken}@${repoUrl.replace("git://", "")}`;

    expect(authenticatedUrl).toBe(expectedUrl);
  });

  it("reject invalid port formats", () => {
    const invalidPorts = ["8080:80:90", "abc", "8080:abc", ":8080", "8080:", ""];

    invalidPorts.forEach((invalidPort) => {
      expect(() => insertDeploymentSchema.parse({
        repoUrl: "",
        githubAppId: 1,
        port: invalidPort,
      })).toThrow(ZodError);
    });
  });

  it("append application name as hostname", () => {
    expect(parseAppHost("weatherapp", "https://younes.fr")).toBe("weatherapp.younes.fr");
  });

  it("throw DEPLOYMENT_APP_ERROR error for invalid host name URL", () => {
    try {
      parseAppHost("weatherapp", "invalid-hostname");
      expect(true).toBe(false);
    }
    catch (error) {
      if (error instanceof DeploymentError) {
        expect(error.name).toBe("DEPLOYMENT_APP_ERROR");
      }
    }
  });

  it("resolve when the last deployment step is completed", async () => {
    const promise = waitForDeploymentToComplete("my-app", {} as TQueue);

    eventHandlers.completed({ jobId: "123" });

    await expect(promise).resolves.toBeUndefined();
  });

  it("reject after 15min with timeout http code", async () => {
    const promise = waitForDeploymentToComplete("my-app", {} as TQueue);

    vi.advanceTimersByTime(900000);

    await expect(promise).rejects.toThrow(new HTTPException(HttpStatusCodes.REQUEST_TIMEOUT, { message: "Deployment timeout exceeded" }));
  });

  it("call removeAllListeners when deployment failed due to timeout", async () => {
    const promise = waitForDeploymentToComplete("my-app", {} as TQueue);
    const queueEventsSpy = vi.spyOn(QueueEvents.prototype, "removeAllListeners");
    vi.advanceTimersByTime(900000);
    await expect(promise).rejects.toThrowError();

    expect(queueEventsSpy).toBeCalledTimes(1);
  });

  it("return command environment variables", ({ environmentVariable }) => {
    const key = environmentVariable.structured[0].key;
    const value = environmentVariable.structured[0].value;
    const expected = [`--env ${key}=${value}`];
    expect(persistedEnvVarsToCmdEnvVars(environmentVariable.structured)).toBe(expected);
  });

  it("return structured environment variables from plain env vars", ({ environmentVariable }) => {
    const key = environmentVariable.structured[0].key;
    const value = environmentVariable.structured[0].value;
    const expected = [{ key, value }, { key, value }];
    expect(plainEnvVarsToPersistedEnvVars(environmentVariable.plain)).toEqual(expected);
  });

  it("return grouped envvironment variables from plain env vars", ({ environmentVariable }) => {
    const key = environmentVariable.structured[0].key;
    const value = environmentVariable.structured[0].value;
    const expected = [`${key}=${value}`, `${key}=${value}`];
    expect(plainEnvVarsToGroupedEnvVars(environmentVariable.plain)).toStrictEqual(expected);
  });
});
