import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import env from "@/env";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { GetFirstRoute, GetServiceRoute, PatchRoute, PatchServiceRoute } from "./server-config.route";

import { getSystemConfig, getSystemConfigFqdn, updateSystemConfig } from "./lib/queries";
import { getWebService, patchWebService } from "./lib/remote-docker/utils";

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

  return c.json({
    ...systemconfig,
    publicIp: env.PUBLIC_IP,
  }, HttpStatusCodes.OK);
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

  return c.json({
    ...systemconfig,
    publicIp: env.PUBLIC_IP,
  }, HttpStatusCodes.OK);
};

export const getWebServiceHandler: AppRouteHandler<GetServiceRoute> = async (c) => {
  const [fqdn, webService] = await Promise.all([
    getSystemConfigFqdn(),
    getWebService(),
  ]);

  return c.json(
    {
      fqdn: fqdn ?? undefined,
      name: webService.name,
      serviceId: webService.serviceId,
    },
    HttpStatusCodes.OK,
  );
};

export const patchWebServiceHandler: AppRouteHandler<PatchServiceRoute> = async (c) => {
  const updates = c.req.valid("json");
  const { id } = c.req.valid("param");

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
    patchWebService({
      name: updates.name,
      fqdn: updates.fqdn,
      serviceId: id.toString(),
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
