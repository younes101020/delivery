import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { GetVersionRoute, UpdateVersionRoute } from "./version.routes";

import { getLatestDeliveryVersion, isPipelineInProgress } from "./lib/github";
import { getDeliveryServiceVersionInfo, isDeliveryServicesUpdating, updateDeliveryVersion } from "./lib/remote-docker/service";

export const getVersion: AppRouteHandler<GetVersionRoute> = async (c) => {
  const [versionInfo, latestVersionInfo, isInProgress] = await Promise.all([
    getDeliveryServiceVersionInfo(),
    getLatestDeliveryVersion(),
    isDeliveryServicesUpdating(),
  ]);

  const shouldBeInferredAsLatest = await isPipelineInProgress();

  const isLatest = versionInfo.version >= latestVersionInfo || shouldBeInferredAsLatest;

  return c.json(
    {
      version: versionInfo.version,
      isLatest,
      isInProgress,
    },
    HttpStatusCodes.OK,
  );
};

export const updateVersion: AppRouteHandler<UpdateVersionRoute> = async (c) => {
  const updatedVersion = await updateDeliveryVersion();

  return c.json(
    {
      version: updatedVersion,
    },
    HttpStatusCodes.OK,
  );
};
