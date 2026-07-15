import { NODE_HEIGHT, NODE_WIDTH, PROJECT_HEADER_HEIGHT, PROJECT_HEIGHT, PROJECT_PADDING, PROJECT_WIDTH } from "./const";

interface Position {
  x: number;
  y: number;
}

interface CanvasNode {
  height?: number;
  measured?: {
    height?: number;
    width?: number;
  };
  position: Position;
  style?: {
    height?: number | string;
    width?: number | string;
  };
  type?: string;
  width?: number;
}

function getProjectDimensions(project: CanvasNode) {
  return {
    height: project.measured?.height ?? project.height ?? (typeof project.style?.height === "number" ? project.style.height : PROJECT_HEIGHT),
    width: project.measured?.width ?? project.width ?? (typeof project.style?.width === "number" ? project.style.width : PROJECT_WIDTH),
  };
}

export function getProjectAtPosition<T extends CanvasNode>(position: Position, nodes: T[]) {
  return nodes.find((node) => {
    const { height, width } = getProjectDimensions(node);

    return node.type === "project"
      && position.x >= node.position.x
      && position.x <= node.position.x + width
      && position.y >= node.position.y
      && position.y <= node.position.y + height;
  });
}

export function clampNodePosition(position: Position, project: CanvasNode) {
  const { height, width } = getProjectDimensions(project);

  return {
    x: Math.max(PROJECT_PADDING, Math.min(position.x, width - NODE_WIDTH - PROJECT_PADDING)),
    y: Math.max(PROJECT_HEADER_HEIGHT + PROJECT_PADDING, Math.min(position.y, height - NODE_HEIGHT - PROJECT_PADDING)),
  };
}
