import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { startDeploy } from "@/lib/tasks/deploy";

import type { CreateRoute } from "./deployments.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const deployment = c.req.valid("json");

  // TODO: move this ssh executation to bullmq job and replace ./ with the path to the cloned repo
  // After github app manifest creation do:

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

  await startDeploy({ clone: githubApp, build: { name: "" } });
  /*

  await ssh.execCommand(
    "ls",
    // `nixpacks build ./ --name ${application.name} -o /data/delivery/applications/${application.name}`
  );

  /* const [inserted] = await db.insert(applications).values(application).returning();

  const withSshOutput = Object.assign(inserted, result); */

  return c.json({} as any, HttpStatusCodes.OK);
};

// TODO: Add job to deploy application and stream logs
