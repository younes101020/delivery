import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";

import type { QueueDeploymentJob } from "../types";

export type Chunk = string;

export interface ISSH {
  onStdout: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => void;
  cwd?: string;
}

export async function build(job: QueueDeploymentJob<"build">) {
  const { repoName, port, env, fqdn, cache } = job.data;
  await job.updateProgress({ logs: "\nImage will be built..." });

  try {
    await ssh(
      `nixpacks build ./ --name ${repoName} ${!cache ? "--no-cache" : ""} --label "traefik.http.routers.${repoName}.rule=Host(\\\`${fqdn}\\\`)" --label "traefik.http.routers.${repoName}.entrypoints=web" && docker run ${port} ${env ?? ""} --network host_network -d ${repoName}`,
      {
        cwd: `${APPLICATIONS_PATH}/${repoName}`,
        onStdout: ({ chunk, chunks, isCriticalError }) => {
          job.updateProgress({ logs: chunk, isCriticalError, jobId: job.id });
          job.updateData({ ...job.data, logs: chunks?.join(), isCriticalError });
        },
      },
    );
  }
  catch (error) {
    throw new DeploymentError({
      name: "BUILD_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error",
    });
  }

  await job.updateProgress({ logs: "Your application is now online! 🚀" });
}
