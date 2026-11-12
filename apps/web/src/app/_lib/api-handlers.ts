import "server-only";
import { createApiHandlers } from "@delivery/api";

import { client } from "@/app/_lib/client-http";
import { getUser } from "@/app/_lib/user-session";
import { getApplicationByName, getApplications } from "@/app/(dashboard)/dashboard/(resources)/applications/_lib/queries";
import { getApplicationsDomainConfiguration } from "@/app/(dashboard)/dashboard/(resources)/applications/domain-name/_lib/queries";
import { getDatabaseService } from "@/app/(dashboard)/dashboard/(resources)/databases/_lib/queries";
import { getCurrentDeploymentsState, getPreviousDeploymentsState } from "@/app/(dashboard)/dashboard/deployments/_lib/queries";
import { getDeliveryWebInstanceConfiguration } from "@/app/(dashboard)/dashboard/settings/general/_lib/queries";
import { env } from "@/env";

import { getTeamForUser } from "../api/team/queries";
import { setInstallationIdOnGithubApp } from "./github/queries";
import { getDeliveryVersionInfo } from "./jobs/queries";

export const apiHandlers = createApiHandlers({
  getApplications,
  getApplicationByName,
  getDatabaseService,
  getApplicationsDomainConfiguration,
  getCurrentDeploymentsState,
  getPreviousDeploymentsState,
  getDeliveryWebInstanceConfiguration,
  getUser,
  getTeamForUser,
  getDeliveryVersionInfo,
  getDeploymentCountStream: () => fetch(`${env.JOBS_API_BASEURL}/deployments/jobs/ongoing/count`),
  getDeploymentLogs: queueName => fetch(`${env.JOBS_API_BASEURL}/deployments/logs/${queueName}`),
  getDeploymentPreview: queueName => fetch(`${env.JOBS_API_BASEURL}/deployments/preview/${queueName}`),
  getApplicationsStream: () => fetch(`${env.JOBS_API_BASEURL}/applications/ongoing`),
  getDatabasesStream: () => fetch(`${env.JOBS_API_BASEURL}/databases/ongoing`),
  redeployApplication: async (queueName) => {
    const http = await client();
    await http.deployments.redeploy[":queueName"].$post({
      param: {
        queueName,
      },
    });
  },
  createGithubApp: async credentials => client().then(http => http.githubapps.$post({ json: credentials })),
  setInstallationIdOnGithubApp,
  fetch,
  getWebBaseUrl: () => env.WEB_BASE_URL,
});
