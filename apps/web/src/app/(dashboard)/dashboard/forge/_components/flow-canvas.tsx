"use client";

import { applyEdgeChanges, applyNodeChanges, ConnectionMode, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { DockerNodeSettings } from "./types";

import { NODE_HEIGHT, NODE_WIDTH, nodeTypes, PROJECT_HEIGHT, PROJECT_PADDING, PROJECT_WIDTH } from "./const";
import { pullDockerImage } from "./pull-docker-image";
import { clampNodePosition, expandProjectToFitNode, getProjectAtPosition } from "./utils";

interface PersistedService {
  nodeId: string;
  serviceId?: string;
  image: string;
  ports: string;
  environmentVariables: string;
  startCommand: string;
  layout: { x: number; y: number; width?: number; height?: number };
}

interface PersistedProject {
  id: string;
  name: string;
  layout: { x: number; y: number; width: number; height: number };
  services: PersistedService[];
}

export default function FlowCanvasWrapper() {
  return <ReactFlowProvider><FlowCanvas /></ReactFlowProvider>;
}

function FlowCanvas() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const nodesRef = useRef<any[]>([]);
  const rf = useReactFlow();

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const persistService = useCallback(async (project: any, service: any) => {
    const response = await fetch("/api/hub/stacks/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: { id: project.id, name: project.data.name },
        projectLayout: getProjectLayout(project),
        service: {
          nodeId: service.id,
          image: service.data.imageName,
          ports: service.data.ports,
          environmentVariables: service.data.environmentVariables,
          startCommand: service.data.startCommand,
          layout: getServiceLayout(service),
        },
      }),
    });
    if (!response.ok)
      throw new Error("Unable to save Forge service.");
  }, []);

  const persistProject = useCallback(async (projectId: string, nextNodes = nodesRef.current) => {
    const project = nextNodes.find(node => node.id === projectId && node.type === "project");
    if (!project)
      return;
    await Promise.all(nextNodes.filter(node => node.type === "docker" && node.parentId === projectId).map(service => persistService(project, service)));
  }, [persistService]);

  const onProjectNameChange = useCallback((id: string, name: string) => {
    setNodes((current) => {
      const next = current.map(node => node.id === id ? { ...node, data: { ...node.data, name } } : node);
      void persistProject(id, next).catch(() => toast.error("Unable to rename project."));
      return next;
    });
  }, [persistProject]);

  const onDockerSettingsChange = useCallback((id: string, settings: DockerNodeSettings) => {
    setNodes((current) => {
      const next = current.map(node => node.id === id ? { ...node, data: { ...node.data, ...settings } } : node);
      const service = next.find(node => node.id === id);
      const project = next.find(node => node.id === service?.parentId);
      if (service && project)
        void persistService(project, service).catch(() => toast.error("Unable to save container settings."));
      return next;
    });
  }, [persistService]);

  const onDockerDelete = useCallback(async (id: string) => {
    const response = await fetch(`/api/hub/stacks/services/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete service.");
      throw new Error("Unable to delete Forge service.");
    }

    setNodes((current) => {
      const next = current.filter(node => node.id !== id);
      nodesRef.current = next;
      return next;
    });
    toast.success("Service deleted.");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/hub/stacks");
        if (!response.ok)
          throw new Error("Unable to load Forge stacks.");
        const { projects } = await response.json() as { projects: PersistedProject[] };
        setNodes(projects.flatMap((project) => {
          const projectNode = createProjectNode(project, onProjectNameChange);
          return [projectNode, ...project.services.map(service => createDockerNode({ project, service, onDockerSettingsChange, onDockerDelete }))];
        }));
      }
      catch {
        toast.error("Unable to load Forge projects.");
      }
    }
    void load();
  }, [onDockerDelete, onDockerSettingsChange, onProjectNameChange]);

  const onNodesChange = useCallback((changes: any[]) => {
    const next = applyNodeChanges(changes, nodesRef.current);
    nodesRef.current = next;
    setNodes(next);
    const resizedNodeIds = changes
      .filter(change => change.type === "dimensions" && !change.resizing)
      .map(change => change.id);

    for (const id of resizedNodeIds) {
      const node = next.find(current => current.id === id);
      if (!node)
        continue;
      if (node.type === "project") {
        void persistProject(id, next).catch(() => toast.error("Unable to save project layout."));
      }
      else if (node.type === "docker") {
        const project = next.find(current => current.id === node.parentId);
        if (project)
          void persistService(project, node).catch(() => toast.error("Unable to save container size."));
      }
    }
  }, [persistProject, persistService]);
  const onEdgesChange = useCallback((changes: any[]) => setEdges(current => applyEdgeChanges(changes, current)), []);

  const onNodeDragStop = useCallback((_event: MouseEvent | TouchEvent, draggedNode: any) => {
    if (draggedNode.type === "project") {
      void persistProject(draggedNode.id, nodesRef.current).catch(() => toast.error("Unable to save project layout."));
      return;
    }
    const current = nodesRef.current;
    const currentNode = current.find(node => node.id === draggedNode.id);
    const sourceProject = current.find(node => node.id === currentNode?.parentId);
    if (!currentNode || !sourceProject)
      return;
    const absolute = { x: sourceProject.position.x + draggedNode.position.x, y: sourceProject.position.y + draggedNode.position.y };
    const target = getProjectAtPosition(absolute, current) ?? sourceProject;
    const position = clampNodePosition({ x: absolute.x - target.position.x, y: absolute.y - target.position.y }, target);
    const expanded = expandProjectToFitNode(position, target);
    const next = current.map(node => node.id === target.id ? expanded : node.id === draggedNode.id ? { ...node, parentId: target.id, position } : node);
    const service = next.find(node => node.id === draggedNode.id);
    const project = next.find(node => node.id === target.id);
    nodesRef.current = next;
    setNodes(next);
    if (service && project)
      void persistService(project, service).catch(() => toast.error("Unable to save container position."));
  }, [persistProject, persistService]);

  const onDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/reactflow");
    if (!raw)
      return;
    const payload: { payload?: { name?: string; label?: string; iconSlug?: string } } = JSON.parse(raw);
    const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const label = payload.payload?.name ?? payload.payload?.label ?? "Docker Image";
    const current = nodesRef.current;
    let project = getProjectAtPosition(position, current);
    const next = [...current];
    if (!project) {
      project = createNewProject(position, onProjectNameChange);
      next.push(project);
    }
    const service = createNewDockerNode({ project, label, iconSlug: payload.payload?.iconSlug, position, onDockerSettingsChange, onDockerDelete });
    const expanded = expandProjectToFitNode(service.position, project);
    const withPendingService = next.map(node => node.id === project.id ? expanded : node).concat(service);
    nodesRef.current = withPendingService;
    setNodes(withPendingService);
    try {
      await pullDockerImage(label);
      const activeService = { ...service, data: { ...service.data, isPullPending: false, isActive: true } };
      const withActiveService = next.map(node => node.id === project.id ? expanded : node).concat(activeService);
      nodesRef.current = withActiveService;
      setNodes(withActiveService);
      await persistService(expanded, activeService);
      toast.success(`${label} started.`);
    }
    catch (error) {
      nodesRef.current = current;
      setNodes(current);
      toast.error(error instanceof Error ? error.message : `Unable to create ${label}.`);
    }
  }, [onDockerDelete, onDockerSettingsChange, onProjectNameChange, persistService, rf]);

  return (
    <div className="h-full w-full" onDragOver={event => event.preventDefault()} onDrop={onDrop}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDragStop={onNodeDragStop} connectionMode={ConnectionMode.Loose} deleteKeyCode={null} fitView />
    </div>
  );
}

function createProjectNode(project: PersistedProject, onNameChange: (id: string, name: string) => void) {
  return { id: project.id, type: "project", position: { x: project.layout.x, y: project.layout.y }, style: { width: project.layout.width, height: project.layout.height }, data: { name: project.name, isActive: true, onNameChange } };
}

function createNewProject(position: { x: number; y: number }, onNameChange: (id: string, name: string) => void) {
  return { id: crypto.randomUUID(), type: "project", position: { x: position.x - PROJECT_PADDING, y: position.y - PROJECT_PADDING }, style: { width: PROJECT_WIDTH, height: PROJECT_HEIGHT }, data: { name: "Project", isActive: true, onNameChange } };
}

function createDockerNode({ project, service, onDockerSettingsChange, onDockerDelete }: { project: PersistedProject; service: PersistedService; onDockerSettingsChange: (id: string, settings: DockerNodeSettings) => void; onDockerDelete: (id: string) => Promise<void> }) {
  return { id: service.nodeId, type: "docker", parentId: project.id, position: service.layout, style: { width: service.layout.width ?? NODE_WIDTH, height: service.layout.height ?? NODE_HEIGHT }, data: { imageName: service.image, ports: service.ports, environmentVariables: service.environmentVariables, startCommand: service.startCommand, isActive: true, onSettingsChange: onDockerSettingsChange, onDelete: onDockerDelete } };
}

function createNewDockerNode({ project, label, iconSlug, position, onDockerSettingsChange, onDockerDelete }: { project: any; label: string; iconSlug?: string; position: { x: number; y: number }; onDockerSettingsChange: (id: string, settings: DockerNodeSettings) => void; onDockerDelete: (id: string) => Promise<void> }) {
  return { id: crypto.randomUUID(), type: "docker", parentId: project.id, position: { x: Math.max(PROJECT_PADDING, position.x - project.position.x), y: Math.max(PROJECT_PADDING, position.y - project.position.y) }, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, data: { imageName: label, iconSlug, ports: getDefaultPorts(label), environmentVariables: "", startCommand: "", isActive: false, isPullPending: true, onSettingsChange: onDockerSettingsChange, onDelete: onDockerDelete } };
}

function getProjectLayout(project: any) {
  return { x: project.position.x, y: project.position.y, width: project.measured?.width ?? project.style?.width ?? PROJECT_WIDTH, height: project.measured?.height ?? project.style?.height ?? PROJECT_HEIGHT };
}

function getServiceLayout(service: any) {
  return {
    x: service.position.x,
    y: service.position.y,
    width: service.measured?.width ?? service.style?.width ?? NODE_WIDTH,
    height: service.measured?.height ?? service.style?.height ?? NODE_HEIGHT,
  };
}

function getDefaultPorts(imageName: string) {
  const image = imageName.toLowerCase().split("/").pop()?.split(":")[0] ?? "";
  return ({ httpd: "80", mariadb: "3306", mongo: "27017", mysql: "3306", nginx: "80", postgres: "5432", rabbitmq: "5672", redis: "6379", traefik: "80, 443" } as Record<string, string>)[image] ?? "";
}
