import configureBullBoard from "@/lib/configure-bull-board";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import applications from "@/routes/applications/applications.index";
import auth from "@/routes/auth/auth.index";
import databases from "@/routes/databases/databases.index";
import deployments from "@/routes/deployments/deployments.index";
import githubApps from "@/routes/githubapps/githubapps.index";
import index from "@/routes/index.route";
import serverConfig from "@/routes/server-config/server-config.index";
import invitation from "@/routes/users/team/invitation/invitation.index";
import team from "@/routes/users/team/team.index";
import users from "@/routes/users/users.index";
import version from "@/routes/version/version.index";

import env from "./env";

const app = createApp();

configureOpenAPI(app);
if (env.ENABLE_DEPLOYMENT_QUEUE_MONITORING === "true")
  configureBullBoard(app);

const routes = [
  index,
  deployments,
  users,
  team,
  invitation,
  githubApps,
  serverConfig,
  auth,
  applications,
  databases,
  version,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
