"use client";

import { useState } from "react";

import { ScrollArea } from "@/app/_components/ui/scroll-area";

import { DockerImagesSearch } from "./docker-images-search";
import { InfiniteDockerImageList } from "./docker-infinite-images-list";

export function DockerImagesPanel() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <DockerImagesSearch query={query} onQueryChange={setQuery} />
      <ScrollArea className="min-h-0 flex-1">
        <InfiniteDockerImageList query={query} />
      </ScrollArea>
    </div>
  );
}
