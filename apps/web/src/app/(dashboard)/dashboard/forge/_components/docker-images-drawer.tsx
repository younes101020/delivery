"use client";

import { Container, X } from "lucide-react";

import { Button } from "@/app/_components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/app/_components/ui/drawer";

import { DockerImagesPanel } from "./docker-images-panel";

export function DockerImagesDrawer() {
  return (
    <Drawer direction="right" modal={false} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Container />
          Docker images
        </Button>
      </DrawerTrigger>
      <DrawerContent showOverlay={false} className="inset-y-0 right-0 left-auto mt-0 h-dvh w-full max-w-xl rounded-none border-y-0 border-r-0 border-l shadow-lg [&>div:first-child]:hidden">
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
  );
}
