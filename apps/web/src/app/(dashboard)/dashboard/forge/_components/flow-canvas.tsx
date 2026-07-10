"use client";

import "@xyflow/react/dist/style.css";
import { addEdge, applyEdgeChanges, applyNodeChanges, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import React, { useCallback, useRef, useState } from "react";

export default function FlowCanvasWrapper() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}

function FlowCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const rf = useReactFlow();

  const onNodesChange = useCallback((changes: any[]) => {
    setNodes(currentNodes => applyNodeChanges(changes, currentNodes));
  }, []);

  const onEdgesChange = useCallback((changes: any[]) => {
    setEdges(currentEdges => applyEdgeChanges(changes, currentEdges));
  }, []);

  const onConnect = useCallback((connection: any) => {
    setEdges(currentEdges => addEdge({ ...connection, animated: true }, currentEdges));
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const raw = event.dataTransfer.getData("application/reactflow");
    if (!raw)
      return;

    let payload: any;
    try {
      payload = JSON.parse(raw);
    }
    catch {
      return;
    }

    let position = { x: event.clientX, y: event.clientY };

    // try screenToFlowPosition if provided, otherwise compute via project with container rect
    if (rf && typeof (rf as any).screenToFlowPosition === "function") {
      position = (rf as any).screenToFlowPosition({ x: event.clientX, y: event.clientY });
    }
    else if (rf && typeof (rf as any).project === "function" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      position = (rf as any).project({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }

    const id = `docker-${Date.now()}`;
    const label = payload?.payload?.name ?? payload?.payload?.label ?? "Docker Image";
    const iconSlug = payload?.payload?.iconSlug;
    const newNode = {
      id,
      type: "default",
      position,
      data: {
        label: (
          <div className="flex items-center gap-2">
            {iconSlug && (
              <img
                src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${iconSlug}.svg`}
                alt=""
                className="h-5 w-5 shrink-0 object-contain"
                onError={(error) => {
                  error.currentTarget.style.display = "none";
                }}
              />
            )}
            <span>{label}</span>
          </div>
        ),
        payload: payload?.payload,
      },
    };

    setNodes(nds => nds.concat(newNode));
  }, [rf, setNodes]);

  return (
    <div ref={containerRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={{ animated: true, style: { stroke: "hsl(var(--primary))", strokeWidth: 2 } }}
        fitView
      />
    </div>
  );
}
