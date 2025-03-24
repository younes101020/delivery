import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";
import { ssh } from "@/lib/ssh";
import { createApplicationServiceSpec } from "@/routes/deployments/lib/services/manifests/application";
import { deleteAppServiceByName, getApplicationNetworkID } from "@/routes/deployments/lib/services/utils";

import type { QueueDeploymentJob } from "../types";

export type Chunk = string;

export interface ISSH {
  onStdout?: ({ chunks, chunk, isCriticalError }: { chunks?: Chunk[]; chunk: Chunk; isCriticalError?: boolean }) => Promise<void>;
  cwd?: string;
}

export async function build(job: QueueDeploymentJob<"build">) {
  const { repoName, port, env, fqdn, cache, staticdeploy, publishdir, isRedeploy } = job.data;
  await job.updateProgress({ logs: "\nImage will be built..." });

  const docker = await getDocker();

  const networkId = await getApplicationNetworkID(repoName);

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
      name: "BUILD_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error",
    });
  });

  if (isRedeploy)
    await deleteAppServiceByName(repoName);

  const appServiceSpec = createApplicationServiceSpec({
    applicationName: repoName,
    image: repoName,
    fqdn,
    port,
    includeApplicationProxy: !isRedeploy,
    networkId,
  });
  await docker.createService(appServiceSpec);

  await job.updateProgress({ logs: "Your application is now online! 🚀" });
}
