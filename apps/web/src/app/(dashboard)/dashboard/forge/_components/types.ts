import type { Node } from "@xyflow/react";

export interface ProjectNodeData {
  [key: string]: unknown;
  name: string;
  onNameChange: (id: string, name: string) => void;
}

export type ProjectNodeType = Node<ProjectNodeData, "project">;

export interface DockerNodeData {
  [key: string]: unknown;
  imageName: string;
  iconSlug?: string;
  ports: string;
  environmentVariables: string;
  startCommand: string;
  onSettingsChange: (id: string, settings: DockerNodeSettings) => void;
}

export interface DockerNodeSettings {
  ports: string;
  environmentVariables: string;
  startCommand: string;
}

export type DockerNodeType = Node<DockerNodeData, "docker">;
