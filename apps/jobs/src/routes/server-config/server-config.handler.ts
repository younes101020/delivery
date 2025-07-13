import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { getSystemConfig, getSystemConfigFqdn, updateSystemConfig } from "@/lib/queries/queries";

import type { GetFirstRoute, GetInstanceRoute, PatchInstanceRoute, PatchRoute } from "./server-config.route";

import { getDeliveryWebInstanceName, updateWebInstanceContainerConfiguration } from "./lib/remote-docker/utils";

export const getFirst: AppRouteHandler<GetFirstRoute> = async (c) => {
  const systemconfig = await getSystemConfig();

  if (!systemconfig) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(systemconfig, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
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

  const systemconfig = await updateSystemConfig(updates);

  if (!systemconfig) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(systemconfig, HttpStatusCodes.OK);
};

export const getInstance: AppRouteHandler<GetInstanceRoute> = async (c) => {
  const [fqdn, name] = await Promise.all([
    getSystemConfigFqdn(),
    getDeliveryWebInstanceName(),
  ]);

  return c.json(
    {
      fqdn: fqdn ?? undefined,
      name,
    },
    HttpStatusCodes.OK,
  );
};

export const patchInstance: AppRouteHandler<PatchInstanceRoute> = async (c) => {
  const updates = c.req.valid("json");
  const logger = c.get("logger");

  if (Object.keys(updates).length === 0) {
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

  await Promise.all([
    updateWebInstanceContainerConfiguration({
      name: updates.name,
      domainName: updates.fqdn,
    }),
    updates.fqdn
      ? updateSystemConfig({
          domainName: updates.fqdn,
        })
      : null,
  ])
    .catch((error) => {
      logger.error("Error updating system configuration and redeploying container:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return c.json(
        {
          message: errorMessage,
        },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    });

  return c.json(null, HttpStatusCodes.OK);
};
