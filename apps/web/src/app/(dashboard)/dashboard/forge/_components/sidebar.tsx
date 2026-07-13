"use client";

import type { ReactNode } from "react";

import { ChevronRight, Container, FolderGit2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";

import { DockerImagesPanel } from "./docker-images-panel";

interface SidebarProps {
  repositories: ReactNode;
}

export default function Sidebar({ repositories }: SidebarProps) {
  return (
    <aside className="h-full min-h-0">
      <Tabs defaultValue="containers" orientation="vertical" className="h-full min-h-0 flex-row gap-0">
        <TabsList className="h-full w-20 flex-col justify-start rounded-none border-r bg-transparent p-1">
          <TabsTrigger value="containers" aria-label="Containers" className="group h-8 w-full flex-none px-0">
            <ChevronRight className="text-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100" />
            <Container />
          </TabsTrigger>
          <TabsTrigger value="repositories" aria-label="Repositories" className="group h-8 w-full flex-none px-0">
            <ChevronRight className="text-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100" />
            <FolderGit2 />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="containers" className="min-w-0 p-4 pt-0">
          <DockerImagesPanel />
        </TabsContent>
        <TabsContent value="repositories" className="min-w-0 p-4 pt-0">
          {repositories}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
