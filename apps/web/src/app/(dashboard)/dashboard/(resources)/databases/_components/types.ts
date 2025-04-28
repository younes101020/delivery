type ProcessName = "start" | "stop" | "create" | "remove";
export interface DatabaseStatusData {
  status: "completed" | "failed" | "active";
  jobId: string;
  containerId: string;
  queueName: ProcessName;
  processName: ProcessName;
}
