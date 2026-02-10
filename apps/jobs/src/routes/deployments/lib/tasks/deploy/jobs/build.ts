import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";
import { defineApplicationServiceTask } from "@/routes/deployments/lib/remote-docker/service-tasks";

import type { QueueDeploymentJob } from "../types";
import type { transformEnvVars } from "../utils";

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

function railpackCmd(env: ReturnType<typeof transformEnvVars> | undefined, startCmd: string | undefined) {
  return {
    init: () => "docker buildx create --use --name builder-containerd --driver docker-container || true",
    prepare: () => {
      return {
        cmd: `railpack prepare --plan-out ./railpack-plan.json --info-out ./railpack-info.json ${env?.cmdEnvVars ?? ""} ${startCmd ? `--start-cmd "${startCmd}"` : ""}`,
        build: (appName: string, cache: boolean) => {
          const secrets = env?.persistedEnvVars.map(envVar => `--secret id=${envVar.key},env=${envVar.key}`).join(" ") ?? "";
          return `docker buildx build \
        -f ./railpack-plan.json --output type=docker,name=${appName} \
        --build-arg ghcr.io/railwayapp/railpack-frontend:v0.17.1 \
        ${secrets} \
        ${cache ? "" : "--no-cache"} ./`;
        },
      };
    },
  };
}
