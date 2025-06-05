"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useIntersectionObserver } from "@/app/_hooks/use-intersection-observer";

import type { GithubApp, Repository } from "../_lib/github/types";

import { useDeploymentApplicationList } from "../_ctx/deployment-application-list";
import { useDeploymentSelectedApplication } from "../_ctx/deployment-selected-application";

export function DeploymentRepositories() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [hasTriggered, setHasTriggered] = useState(false);
  const { isIntersecting, ref } = useIntersectionObserver({ threshold: 0.5 });

  const { applicationsWithGithubApps } = useDeploymentApplicationList();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (isIntersecting && !hasTriggered) {
      setHasTriggered(true);
      const repoPage = params.get("page");
      if (!repoPage) {
        params.set("page", "2");
      }
      else {
        let updatedRepoPage = Number.parseInt(repoPage);
        updatedRepoPage++;
        params.set("page", `${updatedRepoPage}`);
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    else if (!isIntersecting) {
      setHasTriggered(false);
    }
  }, [isIntersecting, pathname, replace, hasTriggered, searchParams]);

  if (!applicationsWithGithubApps) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-8 text-center">
        Unable to get your github repositories.
      </p>
    );
  }

  if (applicationsWithGithubApps.repositories.isPending) {
    return (
      <Skeleton className="h-48" />
    );
  }

  return (
    <ScrollArea>
      <div className="max-h-52 grid grid-cols-1 md:grid-cols-2 gap-2">
        {applicationsWithGithubApps.repositories.repositories.map(repo => (
          <RepositorySection
            repo={repo}
            githubAppId={applicationsWithGithubApps.repositories.githubApp.appId}
            key={repo.id}
          />
        ))}

        {applicationsWithGithubApps.repositories.hasMore && (
          <div ref={ref}>
            <Skeleton className="w-full h-36" />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface RepositorySectionProps {
  repo: Repository;
  githubAppId: GithubApp["appId"];
}

function RepositorySection({ repo, githubAppId }: RepositorySectionProps) {
  const { selectedApplication, setSelectedApplication } = useDeploymentSelectedApplication();
  const isSelected = selectedApplication.name === repo.full_name;
  return (
    <motion.section
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.9 }}
      className="cursor-pointer"
      onClick={() => {
        setSelectedApplication({
          name: repo.full_name,
          id: repo.id,
          githubAppId,
          gitUrl: repo.git_url,
        });
      }}
      data-testid={`${repo.id}-repo-card`}
    >
      <Card className={`h-28 overflow-hidden relative ${isSelected && "border-primary"}`}>
        {isSelected && (
          <div className="absolute top-0 right-0">
            <Check className="bg-primary text-primary-foreground" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-sm">{repo.full_name}</CardTitle>
          <CardDescription className="text-xs">{repo.description ?? "No description"}</CardDescription>
        </CardHeader>
      </Card>
    </motion.section>
  );
}
