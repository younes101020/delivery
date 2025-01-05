import { db } from "@/db";
import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import sshClient from "@/lib/ssh";
import { parseAppHost } from "@/lib/tasks/deploy/utils";

import type { JobFn } from "../../types";

export const build: JobFn<"build"> = async (job) => {
  const { repoName, port, env } = job.data;
  job.updateProgress({ logs: "Image will be built..." });

  const systemconfig = await db.query.systemConfig.findFirst();
  const hostName = systemconfig?.domainName;
  if (!hostName) {
    job.updateProgress({ logs: "No domain name configured in system settings" });
    await job.remove();
  }

  try {
    const fqdn = parseAppHost(repoName, hostName as string);
    const ssh = await sshClient();
    await ssh.execCommand(
      `nixpacks build ./ --name ${repoName} --label "traefik.http.routers.${repoName}.rule=Host(\`${fqdn}\`)" --label "traefik.http.routers.${repoName}.entrypoints=web" && docker run ${port} ${env} --network host_network -d ${repoName}`,
      {
        cwd: `${APPLICATIONS_PATH}/${repoName}`,
        onStdout: chunk => job.updateProgress({ logs: chunk.toString() }),
        onStderr: (chunk) => {
          throw new DeploymentError({
            name: "BUILD_APP_ERROR",
            message: chunk.toString(),
          });
        },
      },
    );
    job.updateProgress({ logs: "Your application is now online! 🚀" });
    return { fqdn, repoName };
  }
  catch (error) {
    if (error instanceof DeploymentError) {
      job.updateProgress({ logs: error.message });
      await job.remove();
    }
  }
};
