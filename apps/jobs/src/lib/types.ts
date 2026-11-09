import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

import type { AuthenticatedApiKey } from "@/middlewares/api-key-auth";

export interface AppBindings {
  Variables: {
    apiKey: AuthenticatedApiKey | undefined;
    logger: PinoLogger;
    sessionUser: { id: number; role: string } | undefined;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
