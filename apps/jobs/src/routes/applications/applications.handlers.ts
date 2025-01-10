import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import {
  createApplication,
  getApplicationById,
  getApplications,
  patchApplication,
} from "@/db/queries";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute } from "./applications.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const applications = await getApplications();
  return c.json(applications);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { applicationData, envVars } = c.req.valid("json");
  const insertedApplication = await createApplication({ applicationData, envVars });
  return c.json(insertedApplication, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const application = await getApplicationById(id);
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
      environmentVariables: application.environmentVariables.map(ev => ({
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

  const noUpdates = Object.keys(updates.applicationData).length === 0 && (!Array.isArray(updates.envVars) || Object.keys(updates.envVars[0]).length === 0);

  if (noUpdates) {
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

  const application = await patchApplication(id, updates);

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
      environmentVariables: application.environmentVariables.map(ev => ({
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
