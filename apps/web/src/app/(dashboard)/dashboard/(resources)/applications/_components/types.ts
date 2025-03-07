export interface ApplicationStatusData {
  status: string;
  jobId: string;
  containerId: string;
  queueName: "start" | "stop";
}
