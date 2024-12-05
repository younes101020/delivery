import { eq } from "drizzle-orm";
import { Buffer } from "node:buffer";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { githubApp, githubAppSecret } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute } from "./githubapps.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const githubApps = await db.query.githubApp.findMany({
    with: {
      secret: true,
    },
  });

  const githubAppsWithPrivateKey = await Promise.all(
    githubApps.map(async (app) => {
      const { secret } = app;
      const privateKey = await decryptSecret({
        encryptedData: Buffer.from(secret.encryptedData, "base64"),
        iv: Buffer.from(secret.iv, "base64"),
        key: await crypto.subtle.importKey(
          "raw",
          Buffer.from(secret.key, "base64"),
          "AES-GCM",
          true,
          ["decrypt"],
        ),
      });
      return { ...app, privateKey };
    }),
  );

  return c.json(githubAppsWithPrivateKey);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const newGithubApp = c.req.valid("json");
  const secret = await encryptSecret(newGithubApp.privateKey);
  const [insertedSecret] = await db.insert(githubAppSecret).values(secret).returning();
  newGithubApp.secretId = insertedSecret.id;
  const [insertedGithubApp] = await db.insert(githubApp).values(newGithubApp).returning();
  return c.json(insertedGithubApp, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const githubApp = await db.query.githubApp.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
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

  const { secret } = githubApp;
  const privateKey = await decryptSecret({
    encryptedData: Buffer.from(secret.encryptedData, "base64"),
    iv: Buffer.from(secret.iv, "base64"),
    key: await crypto.subtle.importKey("raw", Buffer.from(secret.key, "base64"), "AES-GCM", true, [
      "decrypt",
    ]),
  });

  return c.json({ ...githubApp, privateKey }, HttpStatusCodes.OK);
};

export async function encryptSecret(secretKey: string) {
  const encryptionKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(secretKey);
  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    data,
  );

  return {
    encryptedData: Buffer.from(encryptedContent).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    key: Buffer.from(await crypto.subtle.exportKey("raw", encryptionKey)).toString("base64"),
  };
}

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

  const [githubapp] = await db
    .update(githubApp)
    .set(updates)
    .where(eq(githubApp.appId, id))
    .returning();

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

interface Secret {
  encryptedData: BufferSource;
  iv: BufferSource;
  key: CryptoKey;
}

export async function decryptSecret({ encryptedData, iv, key }: Secret) {
  const decryptedContent = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);
  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
}
