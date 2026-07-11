import type { NodeProps } from "@xyflow/react";

import { NodeResizer } from "@xyflow/react";

import type { ProjectNodeType } from "./types";

export function ProjectNode({ data, id, selected }: NodeProps<ProjectNodeType>) {
  return (
    <div className="h-full w-full rounded-md border border-primary/40 bg-background/30 shadow-sm">
      <NodeResizer color="hsl(var(--primary))" isVisible={selected} minWidth={180} minHeight={120} />
      <div className="flex h-9 items-center border-b border-primary/20 px-2">
        <input
          className="nodrag w-full bg-transparent text-xs font-medium outline-none ring-0 focus:ring-0"
          value={data.name}
          aria-label="Project name"
          onChange={event => data.onNameChange(id, event.target.value)}
        />
      </div>
    </div>
  );
}
