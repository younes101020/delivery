"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ActionState } from "@/lib/auth/middleware";
import type { Repository } from "@/lib/github";
import type { Nullable } from "@/lib/utils";
import { Check, Loader2, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { deploy } from "../actions";

type SelectedRepositoryProps = Nullable<{
  name: string;
  gitUrl: string;
  githubAppId: number;
  id: number;
}>;

interface RepositorySectionProps {
  repo: Repository & { githubAppId: number };
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
        console.log(repo.git_url);
        setSelected({
          name: repo.full_name,
          id: repo.id,
          githubAppId: repo.githubAppId,
          gitUrl: repo.git_url,
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

interface DeploymentProps {
  repositories: (Repository & { githubAppId: number })[];
}

export function Deployment({ repositories }: DeploymentProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deploy, { error: "" });
  const { isIntersecting, ref } = useIntersectionObserver();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  const [selected, setSelected] = useState<SelectedRepositoryProps>({
    name: null,
    id: null,
    githubAppId: null,
    gitUrl: null,
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
      <form action={formAction} className="px-5 space-y-4" aria-label="form">
        <div>
          <Label htmlFor="port" className="block text-sm font-medium">
            Exposed or mapped port
          </Label>
          <div className="mt-1">
            <Input
              id="port"
              name="port"
              type="number"
              required
              min={1}
              className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
              placeholder="ex: 3000 or 5695:3000"
            />
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            This port will be used by the reverse proxy to make your application accessible.
          </p>
        </div>
        <div>
          <Label htmlFor="env" className="block text-sm font-medium">
            Environment variables
          </Label>
          <div className="mt-1">
            <Input
              id="env"
              name="env"
              type="text"
              className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
              placeholder="ex: KEY1=value1 KEY2=value2"
            />
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            These variables will be injected into the container environment.
          </p>
        </div>
        <ScrollArea className="h-80 my-4">
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
        <div className="flex justify-end">
          <input type="hidden" name="repoUrl" id="repoUrl" value={selected.gitUrl ?? "no-url"} />
          <input
            type="hidden"
            name="githubAppId"
            id="githubAppId"
            value={selected.githubAppId ?? "no-github-app-id"}
          />
          {state?.error && <div className="text-destructive text-sm">{state.error}</div>}
          <Button type="submit" disabled={!selected.name || pending} aria-label="submit">
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : (
              <>
                <Rocket /> | Deploy
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
