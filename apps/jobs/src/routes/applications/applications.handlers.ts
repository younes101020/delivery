import type { StatusCode } from "hono/utils/http-status";
import type { Buffer } from "node:buffer";

import { HTTPException } from "hono/http-exception";
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
import { getDockerResourceEvents } from "@/lib/remote-docker";
import { getSwarmServiceByName } from "@/lib/remote-docker/utils";
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
import { listApplicationServicesSpec } from "./lib/remote-docker/utils";
import { PREFIX, queueNames } from "./tasks/const";
import { removeApplicationResource } from "./tasks/remove-application";
import { startApplication } from "./tasks/start-application";
import { stopApplication } from "./tasks/stop-application";
import { getApplicationQueuesEvents, getApplicationsActiveJobs } from "./tasks/utils";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const [applicationsServices, activeJobs] = await Promise.all([
    listApplicationServicesSpec(),
    getApplicationsActiveJobs(),
  ]);
  const appsWithStatus = applicationsServices.map((applicationService) => {
    const activeJob = activeJobs.find(job => job.containerId === applicationService.id);
    if (activeJob) {
      return {
        ...applicationService,
        isProcessing: true,
      };
    }
    return applicationService;
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
    const [appQueuesEvents, containerEventStream] = await Promise.all([
      getApplicationQueuesEvents(),
      getDockerResourceEvents("application"),
    ]);

    containerEventStream.on("data", onAppContainerEventHandler);

    for (const queueEvents of appQueuesEvents) {
      queueEvents.on("active", activeHandler);
      queueEvents.on("completed", completeHandler);
      queueEvents.on("failed", failedHandler);
    }

    async function onAppContainerEventHandler(chunk: Buffer) {
      const event = JSON.parse(chunk.toString());
      const processName = event.status === "die" || event.status === "exited" ? "stop" : event.status;
      await stream.writeSSE({
        data: JSON.stringify({
          containerId: event.id,
          processName,
        }),
      });
    }

    async function activeHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueApplicationJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            serviceId: job?.data.serviceId,
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
            serviceId: job?.data.serviceId,
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
            serviceId: job?.data.serviceId,
            queueName,
            status: "failed",
          }),
        });
      }
    }
    return new Promise((resolve) => {
      stream.onAbort(() => {
        for (const queueEvents of appQueuesEvents) {
          queueEvents.removeListener("active", activeHandler);
          queueEvents.removeListener("completed", completeHandler);
          queueEvents.removeListener("failed", failedHandler);
        }
        containerEventStream.removeListener("data", onAppContainerEventHandler);
        resolve();
      });
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { name } = c.req.valid("param");
  const [application, applicationService] = await Promise.all([getApplicationWithEnvVarsByName(name), getSwarmServiceByName(name)]);

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
      serviceId: applicationService.id,
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
  const { name } = c.req.valid("param");
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

  const updatedField = await patchApplication(name, updates);

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
  const { name } = c.req.valid("param");

  const applicationService = await getSwarmServiceByName(name)
    .catch((error) => {
      if (error instanceof Error) {
        const errorResponse = error instanceof HTTPException && error.getResponse();
        if (!errorResponse || HttpStatusCodes.NOT_FOUND !== errorResponse.status) {
          const errorCode = (errorResponse ? errorResponse.status : HttpStatusCodes.INTERNAL_SERVER_ERROR) as StatusCode;
          throw new HTTPException(errorCode, { message: error.message });
        }
      }
    });

  await Promise.all([
    ...(applicationService ? [removeApplicationResource(applicationService.id)] : []),
    deleteApplicationByName(name),
    ssh(
      `rm -Rvf ${name}`,
      {
        cwd: `${APPLICATIONS_PATH}`,
      },
    ),
    deleteDeploymentJobs(name),
  ]).catch((e) => {
    return c.json(
      {
        message: e instanceof Error ? e.message : HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  });

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
