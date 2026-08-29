"use client";

import type { ReactNode } from "react";

import { Container, FolderGit2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/app/_components/ui/drawer";
import { cn } from "@/app/_lib/utils";

import { DockerImagesPanel } from "./docker-images-panel";

interface ForgeSideMenuProps {
  repositories: ReactNode;
}

type OpenDrawer = "images" | "repositories" | null;

export function ForgeSideMenu({ repositories }: ForgeSideMenuProps) {
  const [openDrawer, setOpenDrawer] = useState<OpenDrawer>("images");

  function handleDrawerChange(drawer: Exclude<OpenDrawer, null>, open: boolean) {
    setOpenDrawer(open ? drawer : null);
  }

  return (
    <>
      <aside className="absolute top-0 right-0 z-40 flex w-12 flex-col gap-1 border-l bg-background/95 p-1 shadow-sm backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open Docker images"
          className={cn(openDrawer === "images" && "bg-accent text-accent-foreground")}
          onClick={() => setOpenDrawer("images")}
        >
          <Container />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open GitHub repositories"
          className={cn(openDrawer === "repositories" && "bg-accent text-accent-foreground")}
          onClick={() => setOpenDrawer("repositories")}
        >
          <FolderGit2 />
        </Button>
      </aside>

      <Drawer
        direction="right"
        modal={false}
        open={openDrawer === "images"}
        shouldScaleBackground={false}
        onOpenChange={open => handleDrawerChange("images", open)}
      >
        <DrawerContent showOverlay={false} className="inset-y-0 right-12 left-auto mt-0 h-dvh w-full max-w-xl rounded-none border-y-0 border-r-0 border-l shadow-lg [&>div:first-child]:hidden">
          <DrawerHeader className="shrink-0 border-b pr-14">
            <DrawerTitle>Docker images</DrawerTitle>
          </DrawerHeader>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 right-3" aria-label="Close Docker images">
              <X />
            </Button>
          </DrawerClose>
          <div className="min-h-0 flex-1 p-4">
            <DockerImagesPanel />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        direction="right"
        modal={false}
        open={openDrawer === "repositories"}
        shouldScaleBackground={false}
        onOpenChange={open => handleDrawerChange("repositories", open)}
      >
        <DrawerContent showOverlay={false} className="inset-y-0 right-12 left-auto mt-0 h-dvh w-full max-w-xl rounded-none border-y-0 border-r-0 border-l shadow-lg [&>div:first-child]:hidden">
          <DrawerHeader className="shrink-0 border-b pr-14">
            <DrawerTitle>GitHub repositories</DrawerTitle>
          </DrawerHeader>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 right-3" aria-label="Close GitHub repositories">
              <X />
            </Button>
          </DrawerClose>
          <div className="min-h-0 flex-1 overflow-hidden p-4">
            {repositories}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
