import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { GetVersionRoute } from "./version.routes";

import { getLatestDeliveryVersion } from "./lib/github";
import { getDeliveryServiceVersionInfo } from "./lib/remote-docker/service";

export const getVersion: AppRouteHandler<GetVersionRoute> = async (c) => {
  const [versionInfo, latestVersionInfo] = await Promise.all([
    getDeliveryServiceVersionInfo(),
    getLatestDeliveryVersion(),
  ]);

  const isLatest = versionInfo.version === latestVersionInfo;

  return c.json(
    {
      version: versionInfo.version,
      imageDigest: versionInfo.deliveryCurrentImageDigest,
      isLatest,
    },
    HttpStatusCodes.OK,
  );
};
