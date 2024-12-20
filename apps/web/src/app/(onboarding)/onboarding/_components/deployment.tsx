"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ActionState } from "@/lib/auth/middleware";
import type { Repository } from "@/lib/github";
import type { Nullable } from "@/lib/utils";
import { Check, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { deploy } from "../actions";

interface DeploymentProps {
  repositories: (Repository & { githubAppId: number })[];
}

type SelectedRepositoryProps = Nullable<{
  name: string;
  id: number;
}>;

interface RepositorySectionProps {
  repo: Repository;
  selected: SelectedRepositoryProps;
  setSelected: (repository: SelectedRepositoryProps) => void;
}

function RepositorySection({ repo, setSelected, selected }: RepositorySectionProps) {
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
        });
      }}
      data-testid={`${repo.id}-repo-card`}
    >
      <Card className={`h-40 overflow-hidden relative ${isSelected && "border-primary"}`}>
        {isSelected && (
          <div className="absolute top-0 right-0">
            <Check className="bg-primary" />
          </div>
        )}
        <CardHeader>
          <CardTitle>{repo.full_name}</CardTitle>
          <CardDescription>{repo.description ?? "No description"}</CardDescription>
        </CardHeader>
      </Card>
    </motion.section>
  );
}

export function Deployment({ repositories }: DeploymentProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deploy, { error: "" });
  const { isIntersecting, ref } = useIntersectionObserver();
  console.log(state, pending, isIntersecting);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  const [selected, setSelected] = useState<SelectedRepositoryProps>({
    name: null,
    id: null,
  });

  useEffect(() => {
    if (isIntersecting) {
      const repoPage = params.get("page");
      if (!repoPage) {
        params.set("page", "2");
      } else {
        let updatedRepoPage = parseInt(repoPage);
        updatedRepoPage++;
        params.set("page", `${updatedRepoPage}`);
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isIntersecting]);

  return (
    <>
      <ScrollArea className="h-80 my-4 px-5">
        <div className="max-h-96 grid grid-cols-1 md:grid-cols-2 gap-2">
          {repositories.map((repo) => (
            <RepositorySection
              repo={repo}
              key={repo.id}
              setSelected={setSelected}
              selected={selected}
            />
          ))}
          <div ref={ref}>
            <Skeleton className="w-full h-40" />
          </div>
        </div>
      </ScrollArea>
      <form action={formAction} className="flex justify-end px-5" aria-label="form">
        <input type="hidden" name="repoId" id="repoId" value={selected.id ?? "no-id"} />
        <Button type="submit" disabled={!selected.name} aria-label="submit">
          <Rocket /> | Deploy <span className="underline text-xs">{selected.name ?? ""}</span>
        </Button>
      </form>
    </>
  );
}
