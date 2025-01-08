import { createApplication } from "@/db/queries";
import { DeploymentError } from "@/lib/error";

import type { JobFn } from "../../types";

export const configure: JobFn<"configure"> = async (job) => {
  const { application, environmentVariable, fqdn, repoName } = job.data;
  await job.updateProgress({ logs: "\nWe configure your application..." });
  let applicationId;

  try {
    const persistedApplication = await createApplication(
      { ...application, fqdn, name: repoName },
      environmentVariable,
    );
    await job.updateProgress({
      logs: `\n${persistedApplication.name} configuration saved to database`,
    });
    applicationId = persistedApplication.id;
  }
  catch (error) {
    const isKnownError = error instanceof Error;
    throw new DeploymentError({
      name: "CONFIGURE_APP_ERROR",
      message: isKnownError ? error.message : "Unexpected error",
      cause: isKnownError ? error.cause : "Unexpected cause",
    });
  }
  return applicationId;
};
