import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import {
  deleteApplicationById,
  getApplications,
  getApplicationWithEnvVarsById,
  patchApplication,
} from "@/db/queries/queries";
import { APPLICATIONS_PATH, ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { ssh } from "@/lib/ssh";

import type {
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./applications.routes";

import { deleteDeploymentJobs } from "../deployments/lib/tasks/deploy/utils";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const applications = await getApplications();
  return c.json(applications);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const application = await getApplicationWithEnvVarsById(id);
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
  const { id } = c.req.valid("param");
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

  const updatedField = await patchApplication(id, updates);

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
  const { id } = c.req.valid("param");
  const repoName = await deleteApplicationById(id);

  if (!repoName) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  try {
    await ssh(
      `rm -Rvf ${repoName} && sudo docker rm -f $(docker ps -a -q --filter ancestor=${repoName}) && docker rmi ${repoName}`,
      {
        cwd: `${APPLICATIONS_PATH}`,
        onStdout: () => new Promise(res => res()),
      },
    );
  }
  catch (e) {
    return c.json(
      {
        message: e instanceof Error ? e.message : HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  await deleteDeploymentJobs(repoName);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
