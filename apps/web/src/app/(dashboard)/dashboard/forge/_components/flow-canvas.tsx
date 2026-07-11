"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, ConnectionMode, Panel, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { Plus } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

import { Button } from "@/app/_components/ui/button";

import { NODE_WIDTH, nodeTypes, PROJECT_HEADER_HEIGHT, PROJECT_HEIGHT, PROJECT_PADDING, PROJECT_WIDTH } from "./const";
import { clampNodePosition, getProjectAtPosition } from "./utils";

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
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const rf = useReactFlow();

  const onProjectNameChange = useCallback((id: string, name: string) => {
    setNodes(currentNodes => currentNodes.map(node => node.id === id
      ? { ...node, data: { ...node.data, name } }
      : node));
  }, []);

  const createProject = useCallback((position: { x: number; y: number }, count: number) => ({
    id: `project-${Date.now()}`,
    type: "project",
    position,
    data: { name: `Project ${count}`, onNameChange: onProjectNameChange },
    style: { height: PROJECT_HEIGHT, width: PROJECT_WIDTH },
  }), [onProjectNameChange]);

  const onNodesChange = useCallback((changes: any[]) => {
    setNodes(currentNodes => applyNodeChanges(changes, currentNodes));
  }, []);

  const onEdgesChange = useCallback((changes: any[]) => {
    setEdges(currentEdges => applyEdgeChanges(changes, currentEdges));
  }, []);

  const onConnect = useCallback((connection: any) => {
    setEdges(currentEdges => addEdge({ ...connection, animated: true }, currentEdges));
  }, []);

  const onNodeDragStop = useCallback((_event: MouseEvent | TouchEvent, draggedNode: any) => {
    if (draggedNode.type === "project")
      return;

    setNodes((currentNodes) => {
      const currentNode = currentNodes.find(node => node.id === draggedNode.id);
      const currentProject = currentNodes.find(node => node.id === currentNode?.parentId);
      if (!currentNode || !currentProject)
        return currentNodes;

      const absolutePosition = {
        x: currentProject.position.x + draggedNode.position.x,
        y: currentProject.position.y + draggedNode.position.y,
      };
      const targetProject = getProjectAtPosition(absolutePosition, currentNodes) ?? currentProject;
      const relativePosition = clampNodePosition({
        x: absolutePosition.x - targetProject.position.x,
        y: absolutePosition.y - targetProject.position.y,
      }, targetProject);

      return currentNodes.map(node => node.id === draggedNode.id
        ? { ...node, parentId: targetProject.id, position: relativePosition }
        : node);
    });
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

    if (rf && typeof (rf as any).screenToFlowPosition === "function") {
      position = (rf as any).screenToFlowPosition({ x: event.clientX, y: event.clientY });
    }
    else if (rf && typeof (rf as any).project === "function" && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      position = (rf as any).project({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }

    const label = payload?.payload?.name ?? payload?.payload?.label ?? "Docker Image";
    const iconSlug = payload?.payload?.iconSlug;

    setNodes((currentNodes) => {
      let targetProject = getProjectAtPosition(position, currentNodes);
      const projects = currentNodes.filter(node => node.type === "project");
      const newNodes = [];

      if (!targetProject) {
        targetProject = createProject({
          x: position.x - PROJECT_PADDING,
          y: position.y - PROJECT_HEADER_HEIGHT - PROJECT_PADDING,
        }, projects.length + 1);
        newNodes.push(targetProject);
      }

      const relativePosition = clampNodePosition({
        x: position.x - targetProject.position.x,
        y: position.y - targetProject.position.y,
      }, targetProject);

      newNodes.push({
        id: `docker-${Date.now()}`,
        type: "default",
        parentId: targetProject.id,
        position: relativePosition,
        style: { width: NODE_WIDTH },
        data: {
          label: (
            <div className="flex min-w-0 items-center gap-1">
              {iconSlug && (
                <img
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${iconSlug}.svg`}
                  alt=""
                  className="h-4 w-4 shrink-0 object-contain"
                  onError={(error) => {
                    error.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span className="truncate text-xs">{label}</span>
            </div>
          ),
          payload: payload?.payload,
        },
      });

      return currentNodes.concat(newNodes);
    });
  }, [createProject, rf]);

  const onAddProject = useCallback(() => {
    setNodes((currentNodes) => {
      const projectCount = currentNodes.filter(node => node.type === "project").length;
      const column = projectCount % 3;
      const row = Math.floor(projectCount / 3);
      return currentNodes.concat(createProject({
        x: 32 + column * (PROJECT_WIDTH + 32),
        y: 32 + row * (PROJECT_HEIGHT + 32),
      }, projectCount + 1));
    });
  }, [createProject]);

  return (
    <div ref={canvasRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ animated: true, style: { stroke: "hsl(var(--primary))", strokeWidth: 2 } }}
        fitView
      >
        <Panel position="top-left">
          <Button variant="outline" onClick={onAddProject}>
            <Plus />
            Add project
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
