export interface DatabaseStatusData {
  status: string;
  jobId: string;
  containerId: string;
  queueName: "start" | "stop" | "create";
}
