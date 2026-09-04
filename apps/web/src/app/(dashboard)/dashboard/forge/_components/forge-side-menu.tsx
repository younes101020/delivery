"use client";

import type { ReactNode } from "react";

import { Container, FolderGit2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/app/_components/ui/drawer";
import { cn } from "@/app/_lib/utils";

import type { DockerHubResponse } from "../_lib/docker-hub";

import { DockerImagesPanel } from "./docker-images-panel";

interface ForgeSideMenuProps {
  repositories: ReactNode;
  category?: string;
  databaseImages?: DockerHubResponse;
}

type OpenDrawer = "images" | "repositories" | null;

export function ForgeSideMenu({ repositories, category, databaseImages }: ForgeSideMenuProps) {
  const [drawerContainer, setDrawerContainer] = useState<HTMLDivElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState<OpenDrawer>("images");

  function handleDrawerChange(drawer: Exclude<OpenDrawer, null>, open: boolean) {
    setOpenDrawer(open ? drawer : null);
  }

  return (
    <div ref={setDrawerContainer} className="pointer-events-none absolute inset-0">
      <aside className="pointer-events-auto absolute inset-y-0 right-0 z-40 flex w-12 flex-col gap-1 border-l bg-background/95 p-1 shadow-sm backdrop-blur">
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
        container={drawerContainer}
        modal={false}
        open={openDrawer === "images"}
        shouldScaleBackground={false}
        onOpenChange={open => handleDrawerChange("images", open)}
      >
        <DrawerContent showOverlay={false} className="pointer-events-auto absolute inset-y-0 right-12 left-auto mt-0 w-full max-w-xl rounded-none border-y-0 border-r-0 border-l shadow-lg [&>div:first-child]:hidden">
          <DrawerHeader>
            <DrawerTitle>Services hub</DrawerTitle>
            <DrawerDescription>
              Drag and drop from hundreds of preconfigured services
            </DrawerDescription>
          </DrawerHeader>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 right-3" aria-label="Close Docker images">
              <X />
            </Button>
          </DrawerClose>
          <div className="min-h-0 flex-1 p-4">
            <DockerImagesPanel category={category} initialPage={databaseImages} />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        direction="right"
        container={drawerContainer}
        modal={false}
        open={openDrawer === "repositories"}
        shouldScaleBackground={false}
        onOpenChange={open => handleDrawerChange("repositories", open)}
      >
        <DrawerContent showOverlay={false} className="pointer-events-auto absolute inset-y-0 right-12 left-auto mt-0 w-full max-w-xl rounded-none border-y-0 border-r-0 border-l shadow-lg [&>div:first-child]:hidden">
          <DrawerHeader>
            <DrawerTitle>GitHub Repositories</DrawerTitle>
            <DrawerDescription>
              Drag and drop your repositories to deploy them
            </DrawerDescription>
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
    </div>
  );
}
