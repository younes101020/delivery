type ProcessName = "start" | "stop" | "create" | "remove";

export interface ApplicationStatusData {
  status: "active" | "completed" | "failed";
  jobId: string;
  containerId: string;
  queueName: ProcessName;
  processName: ProcessName;
}
