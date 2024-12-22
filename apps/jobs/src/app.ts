import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import auth from "@/routes/auth/auth.index";
import deployments from "@/routes/deployments/deployments.index";
import githubApps from "@/routes/githubapps/githubapps.index";
import index from "@/routes/index.route";
import onboarding from "@/routes/onboarding/onboarding.index";
import users from "@/routes/users/users.index";

const app = createApp();

configureOpenAPI(app);

const routes = [index, deployments, users, githubApps, onboarding, auth] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
