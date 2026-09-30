"use client";

import type { ReactNode } from "react";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface ForgeFullscreenContextValue {
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
}

const ForgeFullscreenContext = createContext<ForgeFullscreenContextValue | null>(null);

export function ForgeWorkspace({ children }: { children: ReactNode }) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const workspace = workspaceRef.current;
    if (!workspace)
      return;

    try {
      if (document.fullscreenElement === workspace)
        await document.exitFullscreen();
      else
        await workspace.requestFullscreen();
    }
    catch {
      toast.error("Unable to change Forge fullscreen mode.");
    }
  }, []);

  const value = useMemo(() => ({ isFullscreen, toggleFullscreen }), [isFullscreen, toggleFullscreen]);

  return (
    <ForgeFullscreenContext.Provider value={value}>
      <div ref={workspaceRef} className="relative mt-4 min-h-0 flex-1 bg-background">
        {children}
      </div>
    </ForgeFullscreenContext.Provider>
  );
}

export function useForgeFullscreen() {
  const context = useContext(ForgeFullscreenContext);
  if (!context)
    throw new Error("useForgeFullscreen must be used within a ForgeWorkspace.");
  return context;
}
