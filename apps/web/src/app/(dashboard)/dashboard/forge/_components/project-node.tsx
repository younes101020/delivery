import type { NodeProps } from "@xyflow/react";

import { NodeResizer } from "@xyflow/react";

import { Button } from "@/app/_components/ui/button";

import type { ProjectNodeType } from "./types";

export function ProjectNode({ data, id, selected }: NodeProps<ProjectNodeType>) {
  return (
    <div className="h-full w-full rounded-md border border-primary/40 bg-background/30 shadow-sm">
      <NodeResizer color="hsl(var(--primary))" isVisible={selected} minWidth={180} minHeight={120} />
      <div className="flex h-9 items-center gap-2 border-b border-primary/20 px-2">
        <ActivityIndicator isActive={data.isActive} />
        <input
          className="nodrag min-w-0 flex-1 bg-transparent text-xs font-medium outline-none ring-0 focus:ring-0"
          value={data.name}
          aria-label="Project name"
          onChange={event => data.onNameChange(id, event.target.value)}
        />
        <Button className="nodrag nopan h-7 shrink-0 text-xs" size="sm" type="button" disabled={data.isStarting} onClick={() => data.onStart(id)}>
          {data.isStarting ? "Starting..." : "Start project"}
        </Button>
      </div>
    </div>
  );
}

function ActivityIndicator({ isActive }: { isActive: boolean }) {
  const color = isActive ? "bg-blue-500" : "bg-red-500";
  const pingColor = isActive ? "bg-blue-400" : "bg-red-400";

  return (
    <span className="relative flex size-3 shrink-0" aria-label={isActive ? "Active" : "Inactive"}>
      {isActive && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pingColor} opacity-75`} />}
      <span className={`relative inline-flex size-3 rounded-full ${color}`} />
    </span>
  );
}
