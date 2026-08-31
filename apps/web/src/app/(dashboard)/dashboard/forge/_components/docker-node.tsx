"use client";

import type { NodeProps } from "@xyflow/react";

import { Handle, NodeResizer, Position } from "@xyflow/react";
import { Loader2, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";

import type { DockerNodeSettings, DockerNodeType } from "./types";

export function DockerNode({ data, id, selected }: NodeProps<DockerNodeType>) {
  const [open, setOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState<DockerNodeSettings>(getSettings(data));

  useEffect(() => {
    if (!open)
      setSettings(getSettings(data));
  }, [data, open]);

  function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    data.onSettingsChange(id, settings);
    setOpen(false);
  }

  async function deleteService() {
    if (isDeleting)
      return;

    setIsDeleting(true);
    try {
      await data.onDelete(id);
      setIsDeleteDialogOpen(false);
      setOpen(false);
    }
    catch {
      // The canvas reports the deletion failure and preserves the node.
    }
    finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className={`h-full w-full min-w-0 rounded-md border bg-background shadow-sm ${selected ? "border-primary" : "border-border"}`}>
      <NodeResizer color="hsl(var(--primary))" isVisible={selected} minWidth={160} minHeight={68} />
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-primary !bg-background" />
      <div className="flex h-full flex-col gap-1 px-2 py-1">
        <div className="flex min-w-0 items-center gap-1">
          <ActivityIndicator isActive={data.isActive} isPullPending={data.isPullPending} />
          {data.iconSlug && (
            <img
              src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${data.iconSlug}.svg`}
              alt=""
              className="h-3 w-3 shrink-0 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{data.imageName}</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="nodrag nopan h-6 w-6 shrink-0" variant="ghost" size="icon" aria-label={`Configure ${data.imageName}`}>
                <Settings className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="nodrag nopan">
              <DialogHeader>
                <DialogTitle>
                  {data.imageName}
                  {" settings"}
                </DialogTitle>
                <DialogDescription>Configure how this container runs in the stack.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={saveSettings}>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-ports`}>Ports</Label>
                  <Input id={`${id}-ports`} value={settings.ports} onChange={event => setSettings(current => ({ ...current, ports: event.target.value }))} placeholder="80, 443" />
                  <p className="text-xs text-muted-foreground">Container ports, separated by commas.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-environment-variables`}>Environment variables</Label>
                  <Textarea id={`${id}-environment-variables`} value={settings.environmentVariables} onChange={event => setSettings(current => ({ ...current, environmentVariables: event.target.value }))} placeholder="KEY=value" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-start-command`}>Starting command</Label>
                  <Input id={`${id}-start-command`} value={settings.startCommand} onChange={event => setSettings(current => ({ ...current, startCommand: event.target.value }))} placeholder="Leave blank to use the image default" />
                </div>
                <DialogFooter>
                  <Button type="submit">Save settings</Button>
                </DialogFooter>
              </form>
              <div className="border-t pt-4">
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="secondary" className="text-destructive hover:bg-destructive/10" disabled={isDeleting}  >
                      <Trash2 className="size-4" />
                      {`Delete ${data.imageName}`}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="nodrag nopan">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{`Delete ${data.imageName} ?`}</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the service from the stack.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting}
                        onClick={(event) => {
                          event.preventDefault();
                          void deleteService();
                        }}
                      >
                        {isDeleting && <Loader2 className="size-4 animate-spin" />}
                        {`Delete ${data.imageName}`}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-primary !bg-background" />
    </div>
  );
}

function ActivityIndicator({ isActive, isPullPending }: { isActive: boolean; isPullPending?: boolean }) {
  if (isPullPending) {
    return (
      <span className="relative flex size-3 shrink-0" aria-label="Pulling image">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        <span className="relative inline-flex size-3 rounded-full bg-orange-500" />
      </span>
    );
  }

  const color = isActive ? "bg-blue-500" : "bg-red-500";
  const pingColor = isActive ? "bg-blue-400" : "bg-red-400";

  return (
    <span className="relative flex size-3 shrink-0" aria-label={isActive ? "Active" : "Inactive"}>
      {isActive && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pingColor} opacity-75`} />}
      <span className={`relative inline-flex size-3 rounded-full ${color}`} />
    </span>
  );
}

function getSettings(data: DockerNodeType["data"]): DockerNodeSettings {
  return {
    ports: data.ports,
    environmentVariables: data.environmentVariables,
    startCommand: data.startCommand,
  };
}
