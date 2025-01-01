import { APPLICATIONS_PATH } from "@/lib/constants";
import sshClient from "@/lib/ssh";

import type { JobFn } from "../../types";

export const build: JobFn<"build"> = async (job) => {
  const { repoName, port, env } = job.data;

  const ssh = await sshClient();
  await ssh.execCommand(
    `nixpacks build ./ --name ${repoName} \
                       --label traefik.http.routers.${repoName}.rule=Host(\`${repoName}.localhost\`) traefik.http.routers.${repoName}.entrypoints:web \
                       && docker run ${port} ${env} -d ${repoName}`,
    {
      cwd: `${APPLICATIONS_PATH}/${repoName}`,
      onStdout: chunk => job.updateProgress({ logs: chunk.toString() }),
    },
  );
};
