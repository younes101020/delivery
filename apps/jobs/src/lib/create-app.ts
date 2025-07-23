import { OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import env from "@/env";
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
  app.use(onboardingFlag);

  if (env.NODE_ENV !== "test")
    app.use("/", except("/auth/*", bearerAuth({ token: env.BEARER_TOKEN })));

  app.notFound(notFound);
  app.onError((e, c) => {
    if (env.NODE_ENV === "test")
      console.error("Error in app:", e);
    return onError(e, c);
  });
  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
