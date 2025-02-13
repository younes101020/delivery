import { Check } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { Nullable } from "@/app/_lib/utils";

import { Card, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useIntersectionObserver } from "@/app/_hooks/use-intersection-observer";

import type { GithubApp, GithubRepositories, Repository } from "../_lib/github/types";

interface DeploymentReposProps {
  repositories: GithubRepositories;
  githubApp: GithubApp;
  selected: SelectedRepositoryProps;
  setSelected: (repository: SelectedRepositoryProps) => void;
}

export function DeploymentRepositories({ repositories, githubApp, selected, setSelected }: DeploymentReposProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [hasTriggered, setHasTriggered] = useState(false);
  const { isIntersecting, ref } = useIntersectionObserver({ threshold: 0.5 });

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

  return (
    <ScrollArea className="col-span-3 max-h-52">
      <div className="max-h-96 grid grid-cols-1 md:grid-cols-2 gap-2">
        {repositories.repositories.map(repo => (
          <RepositorySection
            repo={repo}
            githubAppId={githubApp.appId}
            key={repo.id}
            setSelected={setSelected}
            selected={selected}
          />
        ))}

        {repositories.hasMore && (
          <div ref={ref}>
            <Skeleton className="w-full h-40" />
          </div>
        )}
      </div>
    </ScrollArea>

  );
}

export type SelectedRepositoryProps = Nullable<{
  name: string;
  gitUrl: string;
  githubAppId: number;
  id: number;
}>;

interface RepositorySectionProps {
  repo: Repository;
  githubAppId: GithubApp["appId"];
  selected: SelectedRepositoryProps;
  setSelected: (repository: SelectedRepositoryProps) => void;
}

function RepositorySection({ repo, setSelected, selected, githubAppId }: RepositorySectionProps) {
  const isSelected = selected.name === repo.full_name;
  return (
    <motion.section
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.9 }}
      className="cursor-pointer"
      onClick={() => {
        setSelected({
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
