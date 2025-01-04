/* eslint-disable ts/ban-ts-comment */
import { it } from "__tests__";
import { testClient } from "hono/testing";
import { describe, expect, vi } from "vitest";
import { ZodError } from "zod";

import { insertDeploymentSchema } from "@/db/dto";
import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";
import { clone } from "@/lib/tasks/deploy/jobs/clone";
import { parseAppHost } from "@/lib/tasks/deploy/utils";

import router from "./deployments.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

vi.mock("@/lib/utils", async () => {
  return {
    decryptSecret: vi.fn().mockResolvedValue("mocked-decrypted-secret"),
  };
});

vi.mock("@octokit/auth-app", async () => {
  return {
    createAppAuth: vi.fn().mockReturnValue(() => ({
      type: "installation",
      installationId: 123,
      token: "mocked-token",
    })),
  };
});

vi.mock("@/lib/ssh", async () => {
  return {
    default: vi.fn().mockResolvedValue({
      execCommand: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
    }),
  };
});

describe("deployments routes", () => {
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
  describe("deployments routes / UT", () => {
    it("should format repo URL correctly with github app auth token", async ({ job }) => {
      const result = await clone(job);

      const expectedUrl = job.data.repoUrl.replace(
        "git://",
        "https://x-access-token:mocked-token@",
      );

      const sshClient = (await import("@/lib/ssh")).default;
      const mockExecCommand = vi.mocked(await sshClient()).execCommand;

      expect(mockExecCommand).toHaveBeenCalledWith(`git clone ${expectedUrl}`, expect.any(Object));
      expect(result).toEqual({ status: "success" });
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

    it("should throw DeploymentError instance for invalid host name URL", () => {
      expect(parseAppHost("weatherapp", "invalid-hostname")).toThrow(
        expect.objectContaining({
          name: "BUILD_APP_ERROR",
          code: "The provided host name is not a valid URL",
          cause: expect.any(Error),
        }),
      );
    });
  });
});
