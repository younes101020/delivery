"use client";

import { useState } from "react";

import { DockerImagesSearch } from "./docker-images-search";
import { InfiniteDockerImageList } from "./docker-infinite-images-list";

export function DockerImagesPanel() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <DockerImagesSearch query={query} onQueryChange={setQuery} />
      <InfiniteDockerImageList query={query} />
    </div>
  );
}
