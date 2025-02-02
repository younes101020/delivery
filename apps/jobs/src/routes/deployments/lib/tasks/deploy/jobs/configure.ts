import { createApplication } from "@/db/queries/queries";
import { DeploymentError } from "@/lib/error";

import type { QueueDeploymentJob } from "../types";

import { extractPortCmd } from "./utils";

export async function configure(job: QueueDeploymentJob<"configure">) {
  const { application, environmentVariable, fqdn } = job.data;
  const port = extractPortCmd(application.port);
  await job.updateProgress({ logs: "\nWe configure your application..." });
  let applicationId;

  try {
    const persistedApplication = await createApplication({
      applicationData: { ...application, fqdn, port },
      envVars: environmentVariable,
    });
    await job.updateProgress({
      logs: `\nApplication configuration saved to database 🗄️`,
      jobId: job.id,
    });
    applicationId = persistedApplication.id;
  }
  catch (error) {
    const expectedError = error instanceof Error;
    const message = expectedError ? error.message : "Unexpected error";
    const cause = expectedError ? error.cause : "Unexpected cause";
    await job.updateProgress({
      logs: `\n${message}`,
      isCriticalError: true,
      jobId: job.id,
    });
    throw new DeploymentError({
      name: "CONFIGURE_APP_ERROR",
      message,
      cause,
    });
  }
  return applicationId;
}
