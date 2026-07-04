"use client";

import React, { Suspense } from "react";

import { useInfiniteDockerImages } from "../_hooks/use-infinite-docker-images";

function getDockerImageIconSlug(img: { name?: string; repo_name?: string; slug?: string }) {
  const rawName = img.repo_name ?? img.slug ?? img.name ?? "docker";

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
  pulls,
  stars,
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px] text-[#0B3550]">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );

  const [iconFailed, setIconFailed] = React.useState(false);

  return (
    <div className="relative rounded-sm border border-white/10 bg-white/[0.025] p-4 pt-[18px] transition-colors hover:border-white/20 hover:bg-white/[0.045] before:pointer-events-none before:absolute before:inset-2 before:border before:border-dashed before:border-white/10 before:content-['']">
      <div className="relative flex items-start justify-between gap-2.5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#EAF1F5]/85 bg-[#EAF1F5]">
          {iconSlug && !iconFailed
            ? (
                <img
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${iconSlug}.svg`}
                  alt=""
                  className="h-6 w-6 object-contain"
                  onError={() => setIconFailed(true)}
                />
              )
            : (
                fallbackIcon
              )}
        </div>

        {official && (
          <span className="whitespace-nowrap rounded-sm border border-[#D9A441]/50 px-[7px] py-[3px] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-[#D9A441]">
            official
          </span>
        )}
      </div>

      <div className="mb-1.5 mt-3.5 break-words font-['IBM_Plex_Mono'] text-base font-medium text-[#F3F8FA]">
        {name}
      </div>

      <p className="mb-4 line-clamp-2 min-h-[38px] text-sm leading-relaxed text-[#B9CEDA]">
        {description || "No description provided."}
      </p>

      <div className="flex justify-between border-t border-dashed border-white/10 pt-2.5 font-['IBM_Plex_Mono'] text-xs text-[#7C93A0]">
        <span>
          pulls
          {" "}
          <b className="font-medium text-[#B9CEDA]">{pulls}</b>
        </span>
        <span>
          stars
          {" "}
          <b className="font-medium text-[#B9CEDA]">{stars}</b>
        </span>
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {images.map((img) => {
          const iconSlug = getDockerImageIconSlug(img);

          return (
            <DockerImageCard
              key={img.repo_name ?? img.name ?? iconSlug}
              name={img.name}
              description={img.description}
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
