import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";
import { defineApplicationServiceTask } from "@/routes/deployments/lib/remote-docker/service-tasks";

import type { QueueDeploymentJob } from "../types";

export type Chunk = string;

export interface ISSH {
  onStdout?: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => Promise<void>;
  cwd?: string;
}

export async function build(job: QueueDeploymentJob<"build">) {
  const { repoName, port, env, cache, staticdeploy, publishdir, isRedeploy, fqdn, enableTls, startCmd } = job.data;
  await job.updateProgress({ logs: "\nImage will be built..." });

  // BUILD APP IMAGE

  const buildImageFromSourceCmd = `railpack build ./ --name ${repoName} --env CI=false ${env ?? ""} ${!cache ? "--no-cache" : ""} ${startCmd ? `--start-cmd "${startCmd}"` : ""}`;

  const extractStaticArtefactCmd = staticdeploy && `railpack build ./ --name buildonly-${repoName} --env CI=false ${env ?? ""} --start-cmd "echo 'static web files extraction in progress...'; /bin/bash" ${!cache ? "--no-cache" : ""} && docker run -dt --name temp-${repoName} buildonly-${repoName} && mkdir -p ./build-artefact && pushd ./build-artefact && docker container cp temp-${repoName}:/app${publishdir} ./ && docker ps -aq --filter ancestor="buildonly-${repoName}" | xargs -r docker stop | xargs -r docker rm && docker rmi buildonly-${repoName} &&`;

  const buildCmd = staticdeploy ? `${extractStaticArtefactCmd} ${buildImageFromSourceCmd}` : buildImageFromSourceCmd;

  try {
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
    );

    // DEPLOY APP SERVICE FROM BUILD IMAGE

    await defineApplicationServiceTask({
      isRedeploy,
      name: repoName,
      fqdn,
      port,
      enableTls,
    });

    await job.updateProgress({ logs: "Your application is now online! 🚀" });
  }
  catch (error) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: error instanceof Error ? error.message.slice(0, 45) : "Unexpected error occurred while building the application.",
    });
  }
}
