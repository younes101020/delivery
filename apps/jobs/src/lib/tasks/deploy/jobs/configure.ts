import { db } from "@/db";
import { applications } from "@/db/schema";

import type { JobFn } from "../../types";

export const configure: JobFn<"configure"> = async (job) => {
  const { port, githubAppId } = job.data;
  await job.updateProgress({ logs: "We configure your application..." });

  const childrenJobsValues = await job.getChildrenValues<{ fqdn: string; repoName: string }>();
  const fqdn = Object.values(childrenJobsValues)[0].fqdn;
  const repoName = Object.values(childrenJobsValues)[0].repoName;

  try {
    const [inserted] = await db
      .insert(applications)
      .values({
        name: repoName,
        fqdn,
        port,
        githubAppId,
      })
      .returning();
    await job.updateProgress({ logs: `${inserted.name} configuration saved to database` });
    return { applicationId: inserted.id };
  }
  catch (error) {
    if (error instanceof Error)
      await job.updateProgress({ logs: error.message, isError: true });
  }
};
