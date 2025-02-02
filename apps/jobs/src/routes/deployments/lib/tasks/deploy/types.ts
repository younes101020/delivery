import type { Job } from "bullmq";

import type { InsertApplicationSchemaWithSharedEnv, InsertEnvironmentVariablesSchema, SelectedGithubAppSecretSchema, SelectedGithubAppsSchema } from "@/db/dto";

type Application = InsertApplicationSchemaWithSharedEnv["applicationData"];

export interface QueueDeploymentJobData {
  repoName: string;
  timeout: number;
  clone: SelectedGithubAppsSchema & {
    secret: SelectedGithubAppSecretSchema;
    repoUrl: string;
  };
  build: {
    env?: string;
    port: string;
    fqdn: string;
    cache: boolean;
    logs?: string;
    isCriticalError?: boolean;
  };
  configure: {
    application: Pick<Application, "port" | "githubAppId">;
    environmentVariable: InsertEnvironmentVariablesSchema[] | undefined;
    fqdn: string;
  };
}

export type QueueDeploymentJobName = keyof QueueDeploymentJobData;

export type QueueDeploymentJob<T extends QueueDeploymentJobName> = Omit<Job, "data"> & { data: QueueDeploymentJobData[T] & { repoName: string; timeout: number } };

export type QueueDeploymentJobFns = Record<string, (job: QueueDeploymentJob<any>, signal: AbortSignal) => Promise<unknown>>;
