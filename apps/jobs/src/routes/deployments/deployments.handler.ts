import { QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { startDeploy } from "@/lib/tasks/deploy";

import type { CreateRoute, StreamRoute } from "./deployments.routes";

export const streamLog: AppRouteHandler<StreamRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const { slug } = c.req.valid("param");
    const queueEvents = new QueueEvents(slug);
    queueEvents.on("progress", async ({ data }) => {
      if (typeof data !== "number" && "logs" in data && typeof data.logs === "string") {
        await stream.writeSSE({
          data: data.logs,
          event: "image-build-logs",
        });
        await stream.sleep(1000);
      }
    });
    queueEvents.on("completed", () => stream.abort());
    queueEvents.on("failed", () => stream.abort());
    queueEvents.on("error", () => stream.abort());
    // no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const deployment = c.req.valid("json");

  const githubApp = await db.query.githubApp.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, deployment.githubAppId);
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
