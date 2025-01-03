import { APPLICATIONS_PATH } from "@/lib/constants";
import sshClient from "@/lib/ssh";

import type { JobFn } from "../../types";

export const build: JobFn<"build"> = async (job) => {
  const { repoName, port, env } = job.data;
  job.updateProgress({ logs: "Image will be built..." });

  const ssh = await sshClient();
  await ssh.execCommand(
    `nixpacks build ./ --name ${repoName} --label "traefik.http.routers.${repoName}.rule=Host(\`${repoName}.localhost\`)" --label "traefik.http.routers.${repoName}.entrypoints=web" && docker run ${port} ${env} --network host_network -d ${repoName}`,
    {
      cwd: `${APPLICATIONS_PATH}/${repoName}`,
      onStdout: chunk => job.updateProgress({ logs: chunk.toString("utf8") }),
      onStderr: chunk => job.updateProgress({ logs: chunk.toString("utf8") }),
    },
  );

  job.updateProgress({ logs: "Your application is now online! 🚀" });
};
