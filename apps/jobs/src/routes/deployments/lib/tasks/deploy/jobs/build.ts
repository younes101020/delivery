import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";

import type { QueueDeploymentJob } from "../types";

export type Chunk = string;

export interface ISSH {
  onStdout?: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => Promise<void>;
  cwd?: string;
}

export async function build(job: QueueDeploymentJob<"build">) {
  const { repoName, port, env, fqdn, cache, staticdeploy, publishdir, isRedeploy } = job.data;
  await job.updateProgress({ logs: "\nImage will be built..." });

  const labelsCmd = `-l "resource=application" -l "traefik.enable=true" -l "traefik.http.routers.${repoName}.rule=Host(\\\`${fqdn}\\\`)" -l "traefik.http.services.${repoName}.loadbalancer.server.port=${port}"`;

  const buildAndExtractStaticArtefactCmd = staticdeploy && `nixpacks build ./ --name buildonly-${repoName} --env CI=false --start-cmd "echo 'static web files extraction in progress...'; /bin/bash" ${!cache ? "--no-cache" : ""} && docker run -dt --name temp-${repoName} buildonly-${repoName} && mkdir -p ./build-artefact && pushd ./build-artefact && docker container cp temp-${repoName}:/app${publishdir} ./ && docker ps -aq --filter ancestor="buildonly-${repoName}" | xargs -r docker stop | xargs -r docker rm && docker rmi buildonly-${repoName} &&`;
  const deployCmd = isRedeploy ? `nixpacks build ./ --name ${repoName} --env CI=false ${env ?? ""} --no-cache && docker rm -f $(docker ps -a -q --filter "ancestor=${repoName}") && docker run --name ${repoName} --restart unless-stopped ${env ?? ""} --network host_network ${labelsCmd} -d ${repoName}` : `nixpacks build ./ --name ${repoName} --env CI=false ${env ?? ""} ${!cache ? "--no-cache" : ""} ${labelsCmd} && docker run  --name ${repoName} --restart unless-stopped --network host_network -d ${repoName}`;

  const fullCmd = staticdeploy ? `${buildAndExtractStaticArtefactCmd} ${deployCmd}` : deployCmd;

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
  ).catch((error) => {
    throw new DeploymentError({
      name: "BUILD_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error",
    });
  });

  await job.updateProgress({ logs: "Your application is now online! 🚀" });
}
