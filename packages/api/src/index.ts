import { basename } from "node:path";

export interface GithubAppCredentials {
  webhookSecret: string;
  clientId: string;
  clientSecret: string;
  appId: number;
  privateKey: string;
  name: string;
}

export interface ApiDependencies {
  getApplications: () => Promise<readonly { name: string }[] | null>;
  getApplicationByName: (params: Promise<{ name: string }>) => Promise<unknown>;
  getDatabaseService: () => Promise<unknown>;
  getApplicationsDomainConfiguration: () => Promise<unknown>;
  getCurrentDeploymentsState: () => Promise<unknown>;
  getPreviousDeploymentsState: () => Promise<unknown>;
  getDeliveryWebInstanceConfiguration: () => Promise<unknown>;
  getUser: () => Promise<unknown>;
  getTeamForUser: () => Promise<unknown>;
  getDeliveryVersionInfo: () => Promise<unknown>;
  getDeploymentCountStream: () => Promise<Response>;
  getDeploymentLogs: (queueName: string) => Promise<Response>;
  getDeploymentPreview: (queueName: string) => Promise<Response>;
  getApplicationsStream: () => Promise<Response>;
  getDatabasesStream: () => Promise<Response>;
  redeployApplication: (queueName: string) => Promise<void>;
  createGithubApp: (credentials: GithubAppCredentials) => Promise<Response>;
  setInstallationIdOnGithubApp: (params: { githubAppId: string; installationId: number }) => Promise<void>;
  fetch: typeof fetch;
  getWebBaseUrl: () => string;
}

interface RouteContext<Params extends Record<string, string>> {
  params: Promise<Params>;
}

export function createApiHandlers(dependencies: ApiDependencies) {
  return {
    getApplications: async () => Response.json(await dependencies.getApplications()),
    getApplicationByName: async (_request: Request, { params }: RouteContext<{ name: string }>) =>
      Response.json(await dependencies.getApplicationByName(params)),
    getDatabaseService: async () => Response.json(await dependencies.getDatabaseService()),
    getApplicationsDomainConfiguration: async () => Response.json(await dependencies.getApplicationsDomainConfiguration()),
    getApplicationsStream: async () => proxyEventStream(dependencies.getApplicationsStream),
    getDatabasesStream: async () => proxyEventStream(dependencies.getDatabasesStream),
    getDeploymentCountStream: async () => proxyEventStream(dependencies.getDeploymentCountStream),
    getDeploymentLogs: async (_request: Request, { params }: RouteContext<{ event: string }>) => {
      const { event } = await params;
      return proxyEventStream(() => dependencies.getDeploymentLogs(event));
    },
    getDeploymentPreview: async (_request: Request, { params }: RouteContext<{ event: string }>) => {
      const { event } = await params;
      return proxyEventStream(() => dependencies.getDeploymentPreview(event));
    },
    getCurrentDeployments: async () => Response.json(await dependencies.getCurrentDeploymentsState()),
    getPreviousDeployments: async () => Response.json(await dependencies.getPreviousDeploymentsState()),
    getDeliveryInstanceConfiguration: async () => Response.json(await dependencies.getDeliveryWebInstanceConfiguration()),
    getUser: async () => Response.json(await dependencies.getUser()),
    getTeam: async () => Response.json(await dependencies.getTeamForUser()),
    getVersion: async () => Response.json(await dependencies.getDeliveryVersionInfo()),
    postGithubEvents: async (request: Request) => {
      const githubData = await request.json() as {
        action?: string;
        repository?: { url: string };
      };

      if (githubData.action === "created" || !githubData.repository) {
        return Response.json({ message: "Event github webhook received, this event is not related to repository" });
      }

      const queueName = basename(githubData.repository.url).toLowerCase();
      const applications = await dependencies.getApplications();
      if (!applications)
        return Response.json({ message: "No applications found" }, { status: 404 });

      if (applications.some(app => app.name === queueName)) {
        await dependencies.redeployApplication(queueName);
        return Response.json({ message: "Application redeploy" });
      }
      return Response.json({ message: "Application not found" }, { status: 404 });
    },
    getGithubInstall: async (request: Request) => {
      const searchParams = new URL(request.url).searchParams;
      const installationId = searchParams.get("installation_id");
      const state = searchParams.get("state");
      const stateObj = JSON.parse(decodeURIComponent(state || "")) as {
        isOnboarding: boolean;
        appId: string;
      };

      const urls = {
        success: stateObj.isOnboarding ? "/onboarding/?step=4" : "/dashboard/applications/new",
        failure: stateObj.isOnboarding ? "/onboarding/?step=3" : "/dashboard/applications/new",
      };

      if (!installationId)
        return redirect(urls.failure);

      try {
        await dependencies.setInstallationIdOnGithubApp({
          githubAppId: stateObj.appId,
          installationId: Number.parseInt(installationId),
        });
      }
      catch (error) {
        console.error(error);
        return redirect(urls.failure);
      }

      return Response.redirect(new URL(urls.success, dependencies.getWebBaseUrl()));
    },
    getGithubRegister: async (request: Request) => {
      const searchParams = new URL(request.url).searchParams;
      const code = searchParams.get("code");
      const isOnboarding = searchParams.get("state");

      if (!code)
        return new Response("Missing code parameter", { status: 400 });

      const response = await dependencies.fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok)
        return new Response("Failed to convert app manifest", { status: response.status });

      const result = await response.json() as {
        id: number;
        slug: string;
        client_id: string;
        client_secret: string;
        webhook_secret: string;
        pem: string;
        name: string;
      };
      const appResponse = await dependencies.createGithubApp({
        webhookSecret: result.webhook_secret,
        clientId: result.client_id,
        clientSecret: result.client_secret,
        appId: result.id,
        privateKey: result.pem,
        name: result.name,
      });

      if (appResponse.status !== 200) {
        const fallbackErrorUrl = isOnboarding === "true" ? "/onboarding/?step=3" : "/dashboard";
        return redirect(fallbackErrorUrl);
      }

      const app = await appResponse.json() as { appId: number };
      const metadata = {
        appId: app.appId,
        isOnboarding: isOnboarding === "true",
      };
      const state = encodeURIComponent(JSON.stringify(metadata));
      return Response.redirect(`https://github.com/apps/${result.slug}/installations/new?state=${state}`);
    },
  };
}

function proxyEventStream(getStream: () => Promise<Response>) {
  return getStream().then(({ body }) => new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  }));
}

function redirect(path: string) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: path,
    },
  });
}
