import type { Job } from "bullmq";

import type { InsertApplicationSchemaWithSharedEnv, InsertEnvironmentVariablesSchema, SelectedGithubAppSecretSchema, SelectedGithubAppsSchema } from "@/lib/dto";
import type { MergeSubJobs } from "@/lib/tasks/types";

import type { KeysOfUnion } from "./utils";

type Application = InsertApplicationSchemaWithSharedEnv["applicationData"];

export interface DeploymentJobData {
  clone: SelectedGithubAppsSchema & {
    secret: SelectedGithubAppSecretSchema;
    repoUrl: string;
    repoName: string;
  };
  build: {
    isRedeploy: boolean;
    env?: string;
    port: number;
    staticdeploy: boolean;
    startCmd?: string;
    publishdir?: string;
    fqdn: string;
    cache: boolean;
    logs?: string;
    isCriticalError?: boolean;
    repoName: string;
    enableTls: boolean;
  };
  configure: {
    application: Pick<Application, "port" | "githubAppId" | "name">;
    environmentVariable: InsertEnvironmentVariablesSchema[] | undefined;
    fqdn: string;
    repoName: string;
  };
}

export type RedeploymentJobData = Omit<DeploymentJobData, "configure">;

export type QueueDeploymentJobData = DeploymentJobData | RedeploymentJobData;

export type QueueDeploymentJobName = KeysOfUnion<QueueDeploymentJobData>;

export type QueueDeploymentJob<T extends QueueDeploymentJobName> = Omit<Job, "data"> &
  { data: (DeploymentJobData & RedeploymentJobData)[T] & { repoName: string } };

export type QueueDeploymentJobFns = Record<string, (job: QueueDeploymentJob<any>) => Promise<unknown>>;

export type AllQueueDeploymentJobsData = MergeSubJobs<QueueDeploymentJobData>;
