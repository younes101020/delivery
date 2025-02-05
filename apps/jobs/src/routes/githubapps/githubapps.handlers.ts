import { Buffer } from "node:buffer";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import {
  createGithubAppWithSecret,
  getGithubAppById,
  getGithubApps,
  updateGithubApp,
} from "@/db/queries/queries";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { decryptSecret, encryptSecret } from "@/lib/utils";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute } from "./githubapps.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const githubApps = await getGithubApps();

  const githubAppsWithPrivateKey = await Promise.all(
    githubApps.map(async (app) => {
      const { secret, ...appWithoutSecret } = app;
      const privateKey = secret
        ? await decryptSecret({
          encryptedData: Buffer.from(secret.encryptedData, "base64"),
          iv: Buffer.from(secret.iv, "base64"),
          key: await crypto.subtle.importKey(
            "raw",
            Buffer.from(secret.key, "base64"),
            "AES-GCM",
            true,
            ["decrypt"],
          ),
        })
        : null;
      return { ...appWithoutSecret, privateKey };
    }),
  );
  return c.json(githubAppsWithPrivateKey);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const newGithubApp = c.req.valid("json");
  const secret = await encryptSecret(newGithubApp.privateKey);
  const insertedGithubApp = await createGithubAppWithSecret(newGithubApp, secret);
  return c.json(insertedGithubApp, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const githubApp = await getGithubAppById(id);
  if (!githubApp) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const { secret } = githubApp;
  const privateKey = secret
    ? await decryptSecret({
      encryptedData: Buffer.from(secret.encryptedData, "base64"),
      iv: Buffer.from(secret.iv, "base64"),
      key: await crypto.subtle.importKey("raw", Buffer.from(secret.key, "base64"), "AES-GCM", true, [
        "decrypt",
      ]),
    })
    : null;

  return c.json({ ...githubApp, privateKey }, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
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

  const githubapp = await updateGithubApp(id, updates);

  if (!githubapp) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(githubapp, HttpStatusCodes.OK);
};
