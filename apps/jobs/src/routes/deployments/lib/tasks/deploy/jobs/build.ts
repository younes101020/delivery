import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";
import { getApplicationNetworkID } from "@/routes/applications/lib/remote-docker/utils";
import { defineApplicationServiceTask } from "@/routes/deployments/lib/remote-docker/service-tasks";

import type { QueueDeploymentJob } from "../types";

export type Chunk = string;

export interface ISSH {
  onStdout?: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => Promise<void>;
  cwd?: string;
}

export async function build(job: QueueDeploymentJob<"build">) {
  const { repoName, port, env, fqdn, cache, staticdeploy, publishdir, isRedeploy } = job.data;
  await job.updateProgress({ logs: "\nImage will be built..." });

  // BUILD APP IMAGE

  const buildImageFromSourceCmd = `nixpacks build ./ --name ${repoName} --env CI=false ${env ?? ""} ${!cache ? "--no-cache" : ""}`;

  const extractStaticArtefactCmd = staticdeploy && `nixpacks build ./ --name buildonly-${repoName} --env CI=false --start-cmd "echo 'static web files extraction in progress...'; /bin/bash" ${!cache ? "--no-cache" : ""} && docker run -dt --name temp-${repoName} buildonly-${repoName} && mkdir -p ./build-artefact && pushd ./build-artefact && docker container cp temp-${repoName}:/app${publishdir} ./ && docker ps -aq --filter ancestor="buildonly-${repoName}" | xargs -r docker stop | xargs -r docker rm && docker rmi buildonly-${repoName} &&`;

  const buildCmd = staticdeploy ? `${extractStaticArtefactCmd} ${buildImageFromSourceCmd}` : buildImageFromSourceCmd;

  await ssh(
    buildCmd,
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
      name: "DEPLOYMENT_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error occurred while building the application.",
    });
  });

  // DEPLOY APP SERVICE FROM BUILD IMAGE

  defineApplicationServiceTask({
    isRedeploy,
    name: repoName,
    fqdn,
    port,
  });

  await job.updateProgress({ logs: "Your application is now online! 🚀" });
}
