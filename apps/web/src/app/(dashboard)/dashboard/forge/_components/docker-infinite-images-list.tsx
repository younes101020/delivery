"use client";

import { GripVertical, ShieldCheck } from "lucide-react";
import React, { Suspense, useState } from "react";

import { useInfiniteDockerImages } from "../_hooks/use-infinite-docker-images";

function getDockerImageIconSlug(img: { name?: string; repo_name?: string; slug?: string }) {
  const rawName = img.name ?? "docker";

  return rawName
    .toLowerCase()
    .split("/")
    .pop()
    ?.replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "docker";
}

function DockerImageCard({
  name,
  description,
  official,
  iconSlug,
}: {
  name: string;
  description?: string;
  pulls?: number | string;
  stars?: number | string;
  official?: boolean;
  iconSlug?: string;
}) {
  const fallbackIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );

  const [iconFailed, setIconFailed] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        try {
          e.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify({ type: "docker", payload: { name, description, iconSlug } }),
          );
          e.dataTransfer.effectAllowed = "move";
        }
        catch {
          // ignore
        }
      }}
      className="relative rounded-sm border p-4 transition-colors hover:border-primary/50 hover:bg-white/[0.045] overflow-hidden"
    >
      <div className="absolute top-1 right-0 flex h-full opacity-50">
        <GripVertical />
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
            {iconSlug && !iconFailed
              ? (
                  <img
                    src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${iconSlug}.svg`}
                    alt={name}
                    className="h-6 w-6 object-contain"
                    onError={() => setIconFailed(true)}
                  />
                )
              : (
                  fallbackIcon
                )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="opacity-70">/</span>
            <span className="font-medium line-clamp-1">{name}</span>
          </div>
        </div>

        {official && (
          <span className="flex gap-1 items-center px-1 absolute top-0 left-0 text-xs uppercase bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
            official
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="mb-2 line-clamp-2 text-xs leading-relaxed">
          {description || "No description provided."}
        </p>
      </div>
    </div>
  );
}

function InfiniteListInner({ query }: { query: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage }
    = useInfiniteDockerImages(query);

  const images = data.pages.flatMap(page => page.results);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 sidebar">
        {images.map((img) => {
          const iconSlug = getDockerImageIconSlug(img);

          return (
            <DockerImageCard
              key={img.repo_name ?? img.name ?? iconSlug}
              name={img.repo_name ?? img.name}
              description={img.description ?? img.short_description}
              pulls={img.pull_count}
              stars={img.star_count}
              official={Boolean(img.is_official)}
              iconSlug={iconSlug}
            />
          );
        })}
      </div>

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

export function InfiniteDockerImageList({ query }: { query: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfiniteListInner query={query} />
    </Suspense>
  );
}
