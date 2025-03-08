import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import {
  deleteApplicationByName,
  getApplicationWithEnvVarsByName,
  patchApplication,
} from "@/db/queries/queries";
import { APPLICATIONS_PATH, ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { ssh } from "@/lib/ssh";
import { getJobAndQueueNameByJobId } from "@/lib/tasks/utils";

import type {
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
  StartRoute,
  StopRoute,
  StreamCurrentApplicationRoute,
} from "./applications.routes";
import type { AllQueueApplicationJobsData } from "./tasks/types";

import { deleteDeploymentJobs } from "../deployments/lib/tasks/deploy/utils";
import { getApplicationsContainers } from "./lib/remote-docker/utils";
import { PREFIX, queueNames } from "./tasks/const";
import { startApplication } from "./tasks/start-application";
import { stopApplication } from "./tasks/stop-application";
import { getApplicationQueuesEvents, getApplicationsActiveJobs } from "./tasks/utils";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const [applications, activeJobs] = await Promise.all([
    getApplicationsContainers(),
    getApplicationsActiveJobs(),
  ]);
  const appsWithStatus = applications.map((app) => {
    const activeJob = activeJobs.find(job => job.containerId === app.id);
    if (activeJob) {
      return {
        ...app,
        isProcessing: true,
      };
    }
    return app;
  });
  return c.json(appsWithStatus, HttpStatusCodes.OK);
};

export const stop: AppRouteHandler<StopRoute> = async (c) => {
  const { id } = c.req.valid("param");

  await stopApplication(id);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const start: AppRouteHandler<StartRoute> = async (c) => {
  const { id } = c.req.valid("param");
  await startApplication(id);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const streamCurrentApplication: AppRouteHandler<StreamCurrentApplicationRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const appQueuesEvents = await getApplicationQueuesEvents();

    for (const queueEvents of appQueuesEvents) {
      queueEvents.on("active", activeHandler);
      queueEvents.on("completed", completeHandler);
      queueEvents.on("failed", failedHandler);
    }

    async function activeHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueApplicationJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            containerId: job?.data.containerId,
            queueName,
            status: "active",
          }),
        });
      }
    }

    async function completeHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueApplicationJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            containerId: job?.data.containerId,
            queueName,
            status: "completed",
          }),
        });
        await job.remove();
      }
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueApplicationJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            containerId: job?.data.containerId,
            queueName,
            status: "failed",
          }),
        });
      }
    }
    return new Promise((resolve) => {
      stream.onAbort(() => {
        for (const queueEvents of dbQueuesEvents) {
          queueEvents.removeListener("active", activeHandler);
          queueEvents.removeListener("completed", completeHandler);
          queueEvents.removeListener("failed", failedHandler);
        }
        resolve();
      });
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { slug } = c.req.valid("param");
  const application = await getApplicationWithEnvVarsByName(slug);
  if (!application) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      ...application,
      environmentVariables: application.applicationEnvironmentVariables.map(ev => ({
        id: ev.environmentVariable.id,
        key: ev.environmentVariable.key,
        value: ev.environmentVariable.value,
        isBuildTime: ev.environmentVariable.isBuildTime,
        createdAt: ev.environmentVariable.createdAt,
        deletedAt: ev.environmentVariable.deletedAt,
        updatedAt: ev.environmentVariable.updatedAt,
      })),
    },
    HttpStatusCodes.OK,
  );
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { slug } = c.req.valid("param");
  const updates = c.req.valid("json");

  const noUpdatesFound = Object.keys(updates.applicationData).length === 0 && (!Array.isArray(updates.environmentVariable) || Object.keys(updates.environmentVariable[0]).length === 0);

  if (noUpdatesFound) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const updatedField = await patchApplication(slug, updates);

  if (!updatedField) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    { ...updatedField.applicationData, environmentVariable: updatedField.environmentVariable },
    HttpStatusCodes.OK,
  );
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { slug } = c.req.valid("param");

  await Promise.all([
    deleteApplicationByName(slug),
    ssh(
      `rm -Rvf ${slug} && sudo docker rm -f $(docker ps -a -q --filter ancestor=${slug}) && docker rmi ${slug}`,
      {
        cwd: `${APPLICATIONS_PATH}`,
      },
    ).catch((e) => {
      return c.json(
        {
          message: e instanceof Error ? e.message : HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }),
    deleteDeploymentJobs(slug),
  ]);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
