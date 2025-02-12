import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";

import type { QueueDeploymentJob } from "../types";

export type Chunk = string;

export interface ISSH {
  onStdout: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => Promise<void>;
  cwd?: string;
}

export async function build(job: QueueDeploymentJob<"build">) {
  const { repoName, port, env, fqdn, cache, staticdeploy, publishdir } = job.data;
  await job.updateProgress({ logs: "\nImage will be built..." });

  const buildAndExtractStaticArtefactCmd = staticdeploy && `nixpacks build ./ --name buildonly-${repoName} --start-cmd "echo 'static web files extraction in progress...'; /bin/bash" ${!cache ? "--no-cache" : ""} && docker run -dt --name temp-${repoName} buildonly-${repoName} && mkdir ./build-artefact && cd ./build-artefact && docker container cp -a temp-${repoName}:/app${publishdir} ./ && docker ps -q --filter ancestor=buildonly-${repoName} | xargs -r docker stop && docker ps -aq --filter ancestor=buildonly-${repoName} | xargs -r docker rm && docker rmi buildonly-${repoName} &&`;
  const deployCmd = `nixpacks build ./ --name ${repoName} ${!cache ? "--no-cache" : ""} --label "traefik.http.routers.${repoName}.rule=Host(\\\`${fqdn}\\\`)" --label "traefik.http.routers.${repoName}.entrypoints=web" --label "traefik.http.services.${repoName}.loadbalancer.server.port=${port}" && docker run ${env ?? ""} --network host_network -d ${repoName}`;

  const fullCmd = staticdeploy ? `${buildAndExtractStaticArtefactCmd} ${deployCmd}` : deployCmd;
  try {
    await ssh(
      fullCmd,
      {
        cwd: `${APPLICATIONS_PATH}/${repoName}`,
        onStdout: async ({ chunk, chunks, isCriticalError }) => {
          await Promise.all([
            job.updateProgress({ logs: chunk, isCriticalError, jobId: job.id }),
            job.updateData({ ...job.data, logs: chunks?.join(), isCriticalError }),
          ]);
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
