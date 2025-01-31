import Redis from "ioredis";
import { describe, expect } from "vitest";
import { ZodError } from "zod";

import { insertDeploymentSchema } from "@/db/dto";
import { DeploymentError } from "@/lib/error";
import { convertGitToAuthenticatedUrl, parseAppHost } from "@/lib/tasks/deploy/jobs/utils";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import { it } from "./fixtures";

describe("deployments related unit tests", () => {
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
});
