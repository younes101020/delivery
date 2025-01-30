/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import Redis from "ioredis";
import { describe, expect, vi } from "vitest";
import { ZodError } from "zod";

import type { QueueDeploymentJob } from "@/lib/tasks/deploy/types";

import { insertDeploymentSchema } from "@/db/dto";
import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";
import { DeploymentError } from "@/lib/error";
import { clone } from "@/lib/tasks/deploy/jobs/clone";
import { parseAppHost } from "@/lib/tasks/deploy/jobs/utils";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import router from "../deployments.index";
import { it } from "./fixtures";
import { mockImports } from "./mocks";

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

describe("deployments routes", () => {
  mockImports();
  it("post /deployments validates the body when creating", async () => {
    const response = await client.deployments.$post(
      {
        // @ts-expect-error
        json: {
          githubAppId: 1,
          port: "3000:3000",
        },
      },
      httpOptions,
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("repoUrl");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });
});

describe("deployments routes / UT", () => {
  it("should return cached redis connection if exists", () => {
    const connection1 = getBullConnection(connection);
    const connection2 = getBullConnection(connection);

    expect(connection1).toBe(connection2);
  });

  it("should return redis instance if redis is passed", () => {
    const connection1 = getBullConnection(connection);

    expect(connection1).toBeInstanceOf(Redis);
  });

  it("should format repo URL correctly with github app auth token", async ({ job }) => {
    await clone(job as QueueDeploymentJob<"clone">);

    const expectedUrl = job.data?.repoUrl.replace(
      "git://",
      "https://x-access-token:mocked-token@",
    );

    const ssh = (await import("@/lib/ssh")).ssh;

    expect(ssh).toHaveBeenCalledWith(`git clone ${expectedUrl} ${job.data?.repoName}`, expect.any(Object));
  });

  it("should reject invalid port formats", ({ deployments }) => {
    const invalidPorts = ["8080:80:90", "abc", "8080:abc", ":8080", "8080:", ""];

    invalidPorts.forEach((invalidPort) => {
      const input = {
        repoUrl: deployments.repoUrl,
        githubAppId: deployments.githubAppId,
        port: invalidPort,
      };

      expect(() => insertDeploymentSchema.parse(input)).toThrow(ZodError);
    });
  });

  it("should append application name to hostname", () => {
    expect(parseAppHost("weatherapp", "https://younes.fr")).toBe("weatherapp.younes.fr");
  });

  it("should throw BUILD_APP_ERROR error for invalid host name URL", () => {
    try {
      parseAppHost("weatherapp", "invalid-hostname");
      expect(true).toBe(false);
    }
    catch (e) {
      if (e instanceof DeploymentError) {
        expect(e.name).toBe("BUILD_APP_ERROR");
      }
    }
  });
});
