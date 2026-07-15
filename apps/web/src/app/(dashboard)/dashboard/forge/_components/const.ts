import { DockerNode } from "./docker-node";
import { ProjectNode } from "./project-node";

export const PROJECT_WIDTH = 240;
export const PROJECT_HEIGHT = 160;
export const NODE_WIDTH = 88;
export const NODE_HEIGHT = 36;
export const PROJECT_PADDING = 12;
export const PROJECT_HEADER_HEIGHT = 36;

export const nodeTypes = { docker: DockerNode, project: ProjectNode };
