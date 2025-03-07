export interface ContainerStatusProps {
  initialState: "created" | "restarting" | "running" | "removing" | "paused" | "exited" | "dead";
  id?: string;
}
