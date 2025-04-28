export interface ContainerStatusProps {
  initialState: "created" | "restarting" | "running" | "remove" | "paused" | "stop" | "dead";
  id: string;
}
