import type { Job, JobNode, Queue, Worker } from "bullmq";

import type {
  InsertApplicationSchemaWithSharedEnv,
  InsertEnvironmentVariablesSchema,
  SelectedGithubAppSecretSchema,
  SelectedGithubAppsSchema,
} from "@/db/dto";

type Application = InsertApplicationSchemaWithSharedEnv["applicationData"];
export interface JobDataMap {
  clone: SelectedGithubAppsSchema & {
    secret: SelectedGithubAppSecretSchema;
    repoUrl: string;
    repoName: string;
    jobId?: string;
  };
  build: {
    repoName: string;
    env?: string;
    port: string;
    fqdn: string;
    cache: boolean;
    jobId?: string;
    logs?: string;
    isCriticalError?: boolean;
  };
  configure: {
    application: Pick<Application, "port" | "githubAppId">;
    environmentVariable: InsertEnvironmentVariablesSchema[] | undefined;
    repoName: string;
    fqdn: string;
    jobId?: string;
  };
}
export interface JobParam<T extends JobName>
  extends Partial<Omit<Job<JobDataMap[T]>, "data" | "updateProgress">> {
  data: JobDataMap[T];
  id?: Job<JobDataMap[T]>["id"];
  updateProgress: Job<JobDataMap[T]>["updateProgress"];
  updateData: Job<JobDataMap[T]>["updateData"];
  remove: Job<JobDataMap[T]>["remove"];
  getChildrenValues: Job<JobDataMap[T]>["getChildrenValues"];
}
export type JobName = keyof JobDataMap;
export type JobFn<T extends JobName> = (job: JobParam<T>) => Promise<unknown>;
export type Jobs = { [K in JobName]: JobFn<K> };

export type JobWorker = Worker<JobDataMap[JobName], any, JobName>;
export type JobQueue = Queue<JobDataMap[JobName]>;

export type CleanupFn = (queue: JobQueue, worker: JobWorker) => Promise<void>;
export interface StartTaskReturn {
  queueName: JobNode["job"]["queueName"];
}
export type { Job };
