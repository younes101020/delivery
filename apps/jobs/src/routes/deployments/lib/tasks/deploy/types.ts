import type { Job } from "bullmq";

import type { InsertApplicationSchemaWithSharedEnv, InsertEnvironmentVariablesSchema, SelectedGithubAppSecretSchema, SelectedGithubAppsSchema } from "@/db/dto";
import type { MergeSubJobs } from "@/lib/tasks/types";

type Application = InsertApplicationSchemaWithSharedEnv["applicationData"];

export interface QueueDeploymentJobData {
  clone: SelectedGithubAppsSchema & {
    secret: SelectedGithubAppSecretSchema;
    repoUrl: string;
    repoName: string;
  };
  build: {
    isRedeploy: boolean;
    env?: string[];
    port: number;
    staticdeploy: boolean;
    publishdir?: string;
    fqdn: string;
    cache: boolean;
    logs?: string;
    isCriticalError?: boolean;
    repoName: string;
  };
  configure: {
    application: Pick<Application, "port" | "githubAppId" | "name">;
    environmentVariable: InsertEnvironmentVariablesSchema[] | undefined;
    fqdn: string;
    repoName: string;
  };
}

export type QueueDeploymentJobName = keyof QueueDeploymentJobData;

export type QueueDeploymentJob<T extends QueueDeploymentJobName> = Omit<Job, "data"> & { data: QueueDeploymentJobData[T] & { repoName: string } };

export type QueueDeploymentJobFns = Record<string, (job: QueueDeploymentJob<any>) => Promise<unknown>>;

export type AllQueueDeploymentJobsData = MergeSubJobs<QueueDeploymentJobData>;
