"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { Installation, Repository } from "@/lib/github";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RepositorySectionProps {
  repo: Repository;
  isIntersecting: boolean;
}

function RepositorySection({ repo, isIntersecting }: RepositorySectionProps) {
  return (
    <motion.section
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      className="cursor-pointer"
    >
      <Card className="h-40 overflow-hidden">
        <CardHeader>
          <CardTitle>{repo.full_name}</CardTitle>
          <CardDescription>
            {repo.description ? repo.description : "No description"}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.section>
  );
}

interface DeploymentProps {
  githubInstallationsWithRepos: Installation[];
  currentPage: number;
}

export function Deployment({ githubInstallationsWithRepos, currentPage }: DeploymentProps) {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.8,
  });
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  const [allItems, setAllItems] = useState<Installation[]>(githubInstallationsWithRepos);

  useEffect(() => {
    if (currentPage > 1) {
      setAllItems(prev => [...prev, ...githubInstallationsWithRepos]);
    }
  }, [currentPage, githubInstallationsWithRepos]);

  useEffect(() => {
    if (isIntersecting) {
      const repoPage = params.get("page");
      if (!repoPage) {
        params.set("page", "2");
      } else if (Number.isInteger(repoPage)) {
        let updatedRepoPage = parseInt(repoPage);
        params.set("page", `${updatedRepoPage++}`);
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isIntersecting]);
  
  return (
    <ScrollArea className="h-80">
      <div className="max-h-96 grid grid-cols-1 md:grid-cols-2 gap-2 px-5">
        {githubInstallationsWithRepos[0].repositories.map(repo => (
          <RepositorySection repo={repo} isIntersecting={isIntersecting} key={repo.id} />
        ))}
      </div>
      <div ref={ref}></div>
    </ScrollArea>
  );
}
