import { createApplication } from "@/db/queries";
import { DeploymentError } from "@/lib/error";

import type { JobFn } from "../../types";

export const configure: JobFn<"configure"> = async (job) => {
  const { application, environmentVariable } = job.data;
  await job.updateProgress({ logs: "We configure your application..." });

  const childrenJobsValues = await job.getChildrenValues<{ fqdn: string; repoName: string }>();
  const fqdn = Object.values(childrenJobsValues)[0].fqdn;
  const repoName = Object.values(childrenJobsValues)[0].repoName;

  try {
    const persistedApplication = await createApplication(
      { ...application, fqdn, name: repoName },
      environmentVariable,
    );
    await job.updateProgress({
      logs: `${persistedApplication.name} configuration saved to database`,
    });
    return { applicationId: persistedApplication.id };
  }
  catch (error) {
    const isKnownError = error instanceof Error;
    throw new DeploymentError({
      name: "CONFIGURE_APP_ERROR",
      message: isKnownError ? error.message : "Unexpected error",
      cause: isKnownError ? error.cause : "Unexpected cause",
    });
  }
};
