import type { Node } from "@xyflow/react";

export interface ProjectNodeData {
  [key: string]: unknown;
  name: string;
  onNameChange: (id: string, name: string) => void;
}

export type ProjectNodeType = Node<ProjectNodeData, "project">;
