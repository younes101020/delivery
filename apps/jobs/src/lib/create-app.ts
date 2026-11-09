import { OpenAPIHono } from "@hono/zod-openapi";
import { except } from "hono/combine";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import env from "@/env";
import { apiKeyAuthMiddleware } from "@/middlewares/api-key-auth";
import { onboardingFlag } from "@/middlewares/onboarding-flag";
import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use(
    "/*",
    cors({
      origin: ["http://localhost:3090", "http://localhost:3000"],
    }),
  );
  app.use(serveEmojiFavicon("📝"));
  app.use(pinoLogger());

  if (env.NODE_ENV !== "test") {
    app.use(onboardingFlag);
    app.use("/", except("/auth/*", apiKeyAuthMiddleware));
  }

  app.notFound(notFound);
  app.onError((e, c) => {
    if (env.NODE_ENV === "test")
      console.error("Error in app:", e);
    return onError(e, c);
  });

  app.use(contextStorage());

  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
