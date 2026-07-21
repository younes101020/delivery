"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, ConnectionMode, Panel, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { Plus } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";

import type { DockerNodeSettings } from "./types";

import { NODE_HEIGHT, NODE_WIDTH, nodeTypes, PROJECT_HEADER_HEIGHT, PROJECT_HEIGHT, PROJECT_PADDING, PROJECT_WIDTH } from "./const";
import { clampNodePosition, expandProjectToFitNode, getProjectAtPosition } from "./utils";

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

  const onDockerSettingsChange = useCallback((id: string, settings: DockerNodeSettings) => {
    setNodes(currentNodes => currentNodes.map(node => node.id === id
      ? { ...node, data: { ...node.data, ...settings } }
      : node));
  }, []);

  const createProject = useCallback((position: { x: number; y: number }, count: number) => ({
    id: `project-${Date.now()}`,
    type: "project",
    position,
    data: { isActive: false, name: `Project ${count}`, onNameChange: onProjectNameChange },
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

  const onDrop = useCallback(async (event: React.DragEvent) => {
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

    try {
      const response = await fetch("/api/hub/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: label }),
      });

      if (!response.ok)
        throw new Error("Image pull failed.");
    }
    catch {
      toast.error(`Unable to pull ${label}.`);
      return;
    }

    setNodes((currentNodes) => {
      let targetProject = getProjectAtPosition(position, currentNodes);
      const projects = currentNodes.filter(node => node.type === "project");
      const newNodes = [];
      let updatedNodes = currentNodes;

      if (!targetProject) {
        targetProject = createProject({
          x: position.x - PROJECT_PADDING,
          y: position.y - PROJECT_HEADER_HEIGHT - PROJECT_PADDING,
        }, projects.length + 1);
        newNodes.push(targetProject);
      }

      const requestedPosition = {
        x: position.x - targetProject.position.x,
        y: position.y - targetProject.position.y,
      };
      const relativePosition = {
        x: Math.max(PROJECT_PADDING, requestedPosition.x),
        y: Math.max(PROJECT_HEADER_HEIGHT + PROJECT_PADDING, requestedPosition.y),
      };
      const expandedProject = expandProjectToFitNode(relativePosition, targetProject);

      if (newNodes.length > 0) {
        const projectIndex = newNodes.findIndex(node => node.id === targetProject.id);
        newNodes[projectIndex] = expandedProject;
      }
      else {
        updatedNodes = currentNodes.map(node => node.id === targetProject.id ? expandedProject : node);
      }

      newNodes.push({
        id: `docker-${Date.now()}`,
        type: "docker",
        parentId: targetProject.id,
        position: relativePosition,
        style: { height: NODE_HEIGHT, width: NODE_WIDTH },
        data: {
          imageName: label,
          isActive: false,
          iconSlug,
          ports: getDefaultPorts(label),
          environmentVariables: "",
          startCommand: "",
          onSettingsChange: onDockerSettingsChange,
        },
      });

      return updatedNodes.concat(newNodes);
    });
  }, [createProject, onDockerSettingsChange, rf]);

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

  const nodesWithProjectActivity = nodes.map((node) => {
    if (node.type !== "project")
      return node;

    const childNodes = nodes.filter(childNode => childNode.parentId === node.id);
    const isActive = childNodes.length > 0 && childNodes.every(childNode => childNode.data.isActive === true);

    return { ...node, data: { ...node.data, isActive } };
  });

  return (
    <div ref={canvasRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodesWithProjectActivity}
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

function getDefaultPorts(imageName: string) {
  const image = imageName.toLowerCase().split("/").pop()?.split(":")[0] ?? "";
  const portsByImage: Record<string, string> = {
    httpd: "80",
    mariadb: "3306",
    mongo: "27017",
    mysql: "3306",
    nginx: "80",
    postgres: "5432",
    rabbitmq: "5672",
    redis: "6379",
    traefik: "80, 443",
  };

  return portsByImage[image] ?? "";
}
