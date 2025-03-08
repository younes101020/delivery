import { FlowProducer, Queue } from "bullmq";
import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { afterEach, describe, expect, vi } from "vitest";

import { it } from "@/routes/deployments/__tests__/fixtures";
import { waitForDeploymentToComplete } from "@/routes/deployments/lib/tasks/deploy/utils";

import { deployApp, JOBS, redeployApp } from "..";

describe("deployments tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  vi.mock("@/routes/deployments/lib/tasks", () => {
    const subscribeWorkerTo = vi.fn();
    return { subscribeWorkerTo };
  });

  const mocks = vi.hoisted(() => {
    const env = { key: "VAR", value: "VAL" };
    return {
      getGithubAppByAppId: vi.fn().mockResolvedValue({ secret: true }),
      getSystemDomainName: vi.fn().mockResolvedValue("https://domain.com"),
      fromGitUrlToQueueName: vi.fn().mockReturnValue("my-app"),
      waitForDeploymentToComplete: vi.fn(),
      parseAppHost: vi.fn().mockReturnValue("https://my-app.domain.com"),
      transformEnvVars: vi.fn().mockReturnValue({ cmdEnvVars: `-e ${env.key}=${env.value}`, persistedEnvVars: [env] }),
    };
  });

  vi.mock("bullmq", async (importOriginal) => {
    const actual = await importOriginal<typeof import("bullmq")>();
    const FlowProducer = vi.fn();
    FlowProducer.prototype.add = vi.fn();

    const Queue = vi.fn();
    Queue.prototype.getActiveCount = vi.fn();
    Queue.prototype.obliterate = vi.fn();
    Queue.prototype.getJobs = vi.fn();
    return { ...actual, FlowProducer, Queue };
  });

  vi.mock("@/db/queries/queries", () => {
    const env = { key: "VAR", value: "VAL" };
    return {
      getGithubAppByAppId: mocks.getGithubAppByAppId,
      getSystemDomainName: mocks.getSystemDomainName,
      getApplicationIdByName: vi.fn().mockResolvedValue(1),
      getEnvironmentVariablesForApplication: vi.fn().mockResolvedValue([env]),
    };
  });

  vi.mock("@/routes/deployments/lib/tasks/deploy/utils", () => {
    const env = { key: "VAR", value: "VAL" };
    return {
      fromGitUrlToQueueName: mocks.fromGitUrlToQueueName,
      transformEnvVars: vi.fn().mockReturnValue(
        {
          cmdEnvVars: `-e ${env.key}=${env.value}`,
          persistedEnvVars: [env],
        },
      ),
      parseAppHost: mocks.parseAppHost,
      waitForDeploymentToComplete: mocks.waitForDeploymentToComplete,
      persistedEnvVarsToCmdEnvVars: vi.fn().mockReturnValue(`-e ${env.key}=${env.value}`),
    };
  });

  describe("`deployApp()` tests", () => {
    it("throw error if the given payload is not an object when attempting to deploy", async () => {
      await expect(deployApp("")).rejects.toThrow(new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Invalid deployment payload" }));
    });

    it("throw error if github app is not found when attempting to deploy", async ({ deployAppPayload }) => {
      mocks.getGithubAppByAppId.mockResolvedValueOnce(null);

      await expect(deployApp(deployAppPayload)).rejects.toThrow(new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Github app not found" }));
    });

    it("throw error if server domain name is not found when attempting to deploy", async ({ deployAppPayload }) => {
      mocks.getSystemDomainName.mockResolvedValueOnce(null);

      await expect(deployApp(deployAppPayload)).rejects.toThrow(new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Domain name of the server not found" }));
    });

    it("throw error if the github app secret is not found when attempting to deploy", async ({ deployAppPayload }) => {
      mocks.getGithubAppByAppId.mockResolvedValueOnce({ secret: null });

      await expect(deployApp(deployAppPayload)).rejects.toThrow(new HTTPException(HttpStatusCodes.UNAUTHORIZED, { message: "Invalid github app secret" }));
    });

    it("call the add method from bullmq flowproducer", async ({ deployAppPayload }) => {
      const spy = vi.spyOn(FlowProducer.prototype, "add");

      await deployApp(deployAppPayload);

      expect(spy).toHaveBeenCalled();
    });

    it("call the add method from bullmq flowproducer with jobs dependencies", async ({ githubApp, deployAppPayload }) => {
      const { repoUrl, cache, publishdir, port: exposedPort, staticdeploy } = deployAppPayload;
      const queueName = mocks.fromGitUrlToQueueName();
      const env = mocks.transformEnvVars();
      const fqdn = mocks.parseAppHost();
      const port = staticdeploy ? 80 : exposedPort;
      mocks.getGithubAppByAppId.mockResolvedValueOnce(githubApp);
      const spy = vi.spyOn(FlowProducer.prototype, "add");

      await deployApp(deployAppPayload);

      expect(spy).toHaveBeenCalledWith({
        name: JOBS.configure,
        data: {
          application: {
            port,
            githubAppId: githubApp.id,
          },
          environmentVariable: env.persistedEnvVars,
          fqdn,
          repoName: queueName,
        },
        queueName,
        children: [
          {
            name: JOBS.build,
            data: { env: env.cmdEnvVars, cache, ...(staticdeploy && { publishdir }), port, staticdeploy, fqdn, repoName: queueName },
            queueName,
            opts: { attempts: 3, failParentOnFailure: true },
            children: [
              {
                name: JOBS.clone,
                data: { ...githubApp, repoUrl, secret: githubApp.secret, repoName: queueName },
                queueName,
                opts: { attempts: 3, failParentOnFailure: true },
              },
            ],
          },
        ],
      });
    });

    it("return queue name", async ({ deployAppPayload }) => {
      const queueName = mocks.fromGitUrlToQueueName();

      const shouldBequeueName = await deployApp(deployAppPayload);

      expect(shouldBequeueName).toBe(queueName);
    });
  });

  describe("`redeployApp()` tests", () => {
    it("throw error if the given payload is not an string when attempting to redeploy", async () => {
      // @ts-expect-error test purpose
      await expect(redeployApp({})).rejects.toThrow(new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Invalid redeployment payload" }));
    });

    it("not call the `waitForDeploymentToComplete()` function when there is no active deployment of my-app", async ({ completedJobs }) => {
      vi.spyOn(Queue.prototype, "getActiveCount").mockResolvedValueOnce(0);
      vi.spyOn(Queue.prototype, "getJobs").mockResolvedValueOnce(completedJobs);

      await redeployApp("my-app");

      expect(waitForDeploymentToComplete).not.toHaveBeenCalled();
    });

    it("call the add method from bullmq flowproducer", async ({ completedJobs }) => {
      const spy = vi.spyOn(FlowProducer.prototype, "add");
      vi.spyOn(Queue.prototype, "getJobs").mockResolvedValueOnce(completedJobs);

      await redeployApp("my-app");

      expect(spy).toHaveBeenCalled();
    });

    it("call the add method from bullmq flowproducer with jobs dependencies", async ({ completedJobs }) => {
      const env = { key: "VAR", value: "VAL" };
      const jobMap = new Map(completedJobs.map(j => [j.name, j.data]));
      const overrideNonInitialQueueData = { isCriticalError: undefined, logs: undefined };
      const queueName = jobMap.get("configure")?.repoName;

      const spy = vi.spyOn(FlowProducer.prototype, "add");
      vi.spyOn(Queue.prototype, "getJobs").mockResolvedValueOnce(completedJobs);

      await redeployApp("my-app");

      expect(spy).toHaveBeenCalledWith({
        name: JOBS.configure,
        data: { ...jobMap.get("configure"), environmentVariable: [env], ...overrideNonInitialQueueData },
        queueName,
        children: [
          {
            name: JOBS.build,
            data: { ...jobMap.get("build"), env: `-e ${env.key}=${env.value}`, ...overrideNonInitialQueueData },
            queueName,
            opts: { attempts: 3, failParentOnFailure: true },
            children: [
              {
                name: JOBS.clone,
                data: { ...jobMap.get("clone"), ...overrideNonInitialQueueData },
                queueName,
                opts: { attempts: 3, failParentOnFailure: true },
              },
            ],
          },
        ],
      });
    });
  });
});
