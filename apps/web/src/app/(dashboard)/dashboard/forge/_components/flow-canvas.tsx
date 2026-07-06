"use client";

import { ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
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
    catch (e) {
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
    const newNode = {
      id,
      type: "default",
      position,
      data: { label: payload?.payload?.name ?? payload?.payload?.label ?? "Docker Image", payload: payload?.payload },
    };

    setNodes(nds => nds.concat(newNode));
  }, [rf, setNodes]);

  return (
    <div ref={containerRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={setNodes} onEdgesChange={setEdges} fitView />
    </div>
  );
}
