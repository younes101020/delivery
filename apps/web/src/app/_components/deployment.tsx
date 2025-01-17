"use client";

import { Check, Loader2, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import type { ActionState } from "@/lib/form-middleware";
import type { Installation, Repository } from "@/lib/github/types";
import type { Nullable } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

import { deploy } from "../actions";

type SelectedRepositoryProps = Nullable<{
  name: string;
  gitUrl: string;
  githubAppId: number;
  id: number;
}>;

interface RepositorySectionProps {
  repo: Repository;
  githubAppId: Installation["githubAppId"];
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
          <CardTitle>{repo.full_name}</CardTitle>
          <CardDescription>{repo.description ?? "No description"}</CardDescription>
        </CardHeader>
      </Card>
    </motion.section>
  );
}

interface DeploymentProps {
  installations: Installation[];
  isOnboarding?: boolean;
}

export function Deployment({ installations, isOnboarding = false }: DeploymentProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deploy, {
    error: "",
    inputs: {
      port: "",
      env: "",
      cache: true,
    },
  });
  const { isIntersecting, ref } = useIntersectionObserver({ threshold: 0.5 });
  const [selected, setSelected] = useState<SelectedRepositoryProps>({
    name: null,
    id: null,
    githubAppId: null,
    gitUrl: null,
  });
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [hasTriggered, setHasTriggered] = useState(false);

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
    <>
      <form action={formAction} className="px-5 space-y-8 mt-8" aria-label="form">
        <div>
          <Label htmlFor="port" className="block text-sm font-medium">
            Exposed or mapped port
          </Label>
          <div className="mt-1">
            <Input
              id="port"
              name="port"
              type="text"
              required
              defaultValue={state.inputs.port}
              className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
              placeholder="ex: 3000 or 5695:3000"
            />
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            This port will be used by the reverse proxy to make your application accessible.
          </p>
        </div>
        <div>
          <Label htmlFor="env" className="block">
            Environment variables
          </Label>
          <div className="mt-1">
            <Input
              id="env"
              name="env"
              type="text"
              defaultValue={state.inputs.env}
              className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
              placeholder="ex: KEY1=value1 KEY2=value2"
            />
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            These variables will be injected into the container environment.
          </p>
        </div>
        <div>
          <p className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-2">
            Application source
          </p>
          <ScrollArea className="max-h-80">
            <div className="max-h-96 grid grid-cols-1 md:grid-cols-2 gap-2">
              {installations[0].repositories.map(repo => (
                <RepositorySection
                  repo={repo}
                  githubAppId={installations[0].githubAppId}
                  key={repo.id}
                  setSelected={setSelected}
                  selected={selected}
                />
              ))}

              {installations[0].hasMore && (
                <div ref={ref}>
                  <Skeleton className="w-full h-40" />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <p className="text-muted-foreground text-xs">
          This GitHub repository will be the source of your application.
        </p>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cache"
            name="cache"
            defaultChecked={!!(state.inputs.cache === "on" || state.inputs.cache)}
            key={state.inputs.cache}
          />
          <div className="flex flex-col">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable caching
            </label>
            <p className="block text-xs text-muted-foreground">
              Unchanged dependencies will not be reinstalled
            </p>
          </div>
        </div>
        <div className={`flex ${state.error ? "justify-between" : "justify-end"}`}>
          <input type="hidden" name="repoUrl" id="repoUrl" value={selected.gitUrl ?? "no-url"} />
          <input
            type="hidden"
            name="githubAppId"
            id="githubAppId"
            value={selected.githubAppId ?? "no-github-app-id"}
          />
          {isOnboarding && (
            <input type="hidden" name="isOnboarding" id="isOnboarding" value="true" />
          )}
          {state?.error && (
            <p className="text-destructive bg-destructive/15 p-2 text-sm border border-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={!selected.name || pending} aria-label="submit">
            {pending
              ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                )
              : (
                  <>
                    <Rocket />
                    {" "}
                    | Deploy
                  </>
                )}
          </Button>
        </div>
      </form>
    </>
  );
}
