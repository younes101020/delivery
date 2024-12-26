import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { startDeploy } from "@/lib/tasks/deploy";
import { connection } from "@/lib/tasks/worker";

import type { CreateRoute, StreamRoute } from "./deployments.routes";

export const streamLog: AppRouteHandler<StreamRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const { slug } = c.req.valid("param");
    const queue = new Queue(slug, { connection: connection.duplicate() });
    const queueEvents = new QueueEvents(slug, { connection: connection.duplicate() });
    queueEvents.on("progress", progressHandler);
    queueEvents.on("completed", completeHandler);
    async function progressHandler({ data }: { data: number | object }) {
      if (typeof data !== "number" && "logs" in data && typeof data.logs === "string") {
        await stream.writeSSE({
          data: data.logs,
          event: "image-build-logs",
        });
      }
    }
    async function completeHandler(job: { jobId: string; returnvalue: string; prev?: string }) {
      const jobState = await Job.fromId(queue, job.jobId);
      if (jobState?.name === "build") {
        stream.close();
      }
    }
    stream.onAbort(() => {
      queueEvents.removeListener("progress", progressHandler);
      queueEvents.removeListener("completed", completeHandler);
    });
    while (true) {
      await stream.sleep(4000);
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const deployment = c.req.valid("json");

  const githubApp = await db.query.githubApp.findFirst({
    where(fields, operators) {
      return operators.eq(fields.appId, deployment.githubAppId);
    },
    with: {
      secret: true,
    },
  });

  if (!githubApp) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const tracking = await startDeploy({
    clone: { ...githubApp, repoUrl: deployment.repoUrl },
    build: { name: "" },
  });

  return c.json(tracking, HttpStatusCodes.OK);
};
