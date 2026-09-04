"use client";

import { useState } from "react";

import { ScrollArea } from "@/app/_components/ui/scroll-area";

import type { DockerHubResponse } from "../_lib/docker-hub";

import { DockerImagesSearch } from "./docker-images-search";
import { InfiniteDockerImageList } from "./docker-infinite-images-list";

interface DockerImagesPanelProps {
  category?: string;
  initialPage?: DockerHubResponse;
}

export function DockerImagesPanel({ category, initialPage }: DockerImagesPanelProps) {
  const [query, setQuery] = useState("");
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <DockerImagesSearch category={category} query={query} onQueryChange={setQuery} />
      <ScrollArea className="min-h-0 flex-1">
        <InfiniteDockerImageList category={category} initialPage={initialPage} query={query} />
      </ScrollArea>
    </div>
  );
}
