import { createApplication } from "@/db/queries/queries";
import { DeploymentError } from "@/lib/error";

import type { QueueDeploymentJob } from "../types";

export async function configure(job: QueueDeploymentJob<"configure">) {
  const { application, environmentVariable, fqdn } = job.data;
  await job.updateProgress({ logs: "\nWe configure your application..." });
  let applicationId;

  try {
    const { id: ApplicationId } = await createApplication({
      applicationData: { ...application, fqdn, port: application.port },
      envVars: environmentVariable,
    });
    await job.updateProgress({
      logs: `\nApplication configuration saved to database 🗄️`,
      jobId: job.id,
    });
    applicationId = ApplicationId ?? 0;
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
    await job.updateData({ ...job.data, logs: message, isCriticalError: true });
    throw new DeploymentError({
      name: "CONFIGURE_APP_ERROR",
      message,
      cause,
    });
  }
  return applicationId;
}
