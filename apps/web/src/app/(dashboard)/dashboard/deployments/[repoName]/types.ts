export type DeploymentLogState = {
  jobName: "clone" | "build" | "configure";
  jobId: string;
  logs: string;
  isCriticalError: boolean;
} | {
  completed: boolean;
  appId: number;
};
