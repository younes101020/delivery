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

  const build = railpackCmd(env, startCmd, repoName, cache ?? false);

  let buildCmd = build.plan();
  if (staticdeploy)
    buildCmd += build.staticArtefact(publishdir ?? "/");
  buildCmd += build.build();

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
      message: error instanceof Error ? error.message : "Unexpected error occurred while building the application.",
    });
  }
}

function railpackCmd(env: ReturnType<typeof transformEnvVars> | undefined, startCmd: string | undefined, appName: string, cache: boolean) {
  return {
    plan: () => `docker buildx use builder-containerd && railpack prepare . --plan-out ./railpack-plan.json --info-out ./railpack-info.json ${env?.cmdEnvVars ?? ""} ${startCmd ? `--start-cmd "${startCmd}"` : ""} && `,
    staticArtefact: (publishDir: string) => `docker buildx build -f ./railpack-plan.json --output type=docker,name=buildonly-${appName} --build-arg BUILDKIT_SYNTAX="ghcr.io/railwayapp/railpack-frontend:v0.17.1" ${cache ? "" : "--no-cache"} ./ && docker run -dt --name temp-${appName} buildonly-${appName} && mkdir -p ./build-artefact && pushd ./build-artefact && docker container cp temp-${appName}:/app${publishDir} ./ && docker ps -aq --filter ancestor="buildonly-${appName}" | xargs -r docker stop | xargs -r docker rm && docker rmi buildonly-${appName} && `,
    build: () => {
      const secrets = env?.persistedEnvVars.map(envVar => `--secret id=${envVar.key},env=${envVar.key}`).join(" ") ?? "";
      return `docker buildx build -f ./railpack-plan.json --output type=docker,name=${appName} --build-arg BUILDKIT_SYNTAX="ghcr.io/railwayapp/railpack-frontend:v0.17.1" ${secrets} ${cache ? "" : "--no-cache"} ./`;
    },
  };
}
