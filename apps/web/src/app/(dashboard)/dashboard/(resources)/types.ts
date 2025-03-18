export interface ContainerStatusProps {
  initialState: "created" | "restarting" | "running" | "remove" | "paused" | "exited" | "dead";
  id: string;
}
