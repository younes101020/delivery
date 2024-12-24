import { APPLICATIONS_PATH } from "@/lib/constants";
import sshClient from "@/lib/ssh";

import type { JobFn } from "../../types";
import type { CloneReturnType } from "./clone";

export const build: JobFn<"build", any> = async (job) => {
  const childrenJobsValues = await job.getChildrenValues<CloneReturnType>();
  const repoName = childrenJobsValues.clone.repoName;
  const ssh = await sshClient();
  await ssh.execCommand(`nixpacks build ./ --name ${repoName} -o ./${repoName}`, {
    cwd: APPLICATIONS_PATH,
    onStdout: chunk => job.updateProgress({ logs: chunk.toString() }),
  });
  return job;
};
