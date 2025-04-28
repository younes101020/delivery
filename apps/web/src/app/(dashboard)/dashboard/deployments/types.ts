export interface DeploymentPreviewState {
  step: "clone" | "build" | "configure";
  status: string;
  repoName: string;
}
