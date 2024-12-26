import { APPLICATIONS_PATH } from "@/lib/constants";
import sshClient from "@/lib/ssh";

import type { JobFn } from "../../types";

export const build: JobFn<"build"> = async (job) => {
  const childrenJobsValues = await job.getChildrenValues<{ repoName: string }>();
  const repoName = Object.values(childrenJobsValues)[0].repoName;

  const ssh = await sshClient();
  await ssh.execCommand(`nixpacks build ./ --name ${repoName} && docker run -d ${repoName}`, {
    cwd: `${APPLICATIONS_PATH}/${repoName}`,
    onStdout: chunk => job.updateProgress({ logs: chunk.toString() }),
  });
};
