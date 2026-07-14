"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useOptimistic, useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";

import type { GithubApp } from "../_lib/github/types";

import { useDeploymentApplicationList } from "../_ctx/deployment-application-list";
import { AddNewGithubApp } from "./deployment-add-github-app";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface SelectedGithubApp {
  githubAppId: number;
  isPending: boolean;
}

interface DeploymentGithubAppListProps {
  defaultOpen?: boolean;
}

export function DeploymentGithubAppList({ defaultOpen = true }: DeploymentGithubAppListProps) {
  const { applicationsWithGithubApps } = useDeploymentApplicationList();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = new URLSearchParams(searchParams);

  const githubAppSearchParam = params.get("githubapp") ? Number.parseInt(params.get("githubapp") as string) : applicationsWithGithubApps?.repositories.githubApp.appId;

  const [optimisticSelectedGHApp, addOptimisticSelectedGHApp] = useOptimistic(
    {
      githubAppId: githubAppSearchParam,
      isPending: false,
    },
    (_, newSelectedGithubApp: SelectedGithubApp) => newSelectedGithubApp,
  );

  const handleGithubAppClick = (appId: number) => {
    startTransition(() => {
      addOptimisticSelectedGHApp({
        githubAppId: appId,
        isPending: true,
      });
    });

    params.set("githubapp", `${appId}`);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <section className={`shrink-0 overflow-hidden transition-[width] duration-200 ${isOpen ? "w-64" : "w-9"}`}>
      <button
        type="button"
        aria-label={`${isOpen ? "Hide" : "Show"} GitHub Apps`}
        className={`flex w-full items-center rounded-md py-1 text-sm font-medium hover:bg-muted ${isOpen ? "justify-between px-2" : "justify-center"}`}
        onClick={() => setIsOpen(open => !open)}
      >
        {isOpen ? <span>GitHub Apps</span> : null}
        {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
      {isOpen
        ? (
            <ScrollArea>
              <div className="flex max-h-52 flex-col gap-2 pt-2">
                <AddNewGithubApp />
                <Separator />
                {applicationsWithGithubApps
                  ? applicationsWithGithubApps.githubApps.map(
                      ghApp => (
                        <GithubAppCard
                          key={ghApp.appId}
                          githubApp={ghApp}
                          handleGithubAppClick={handleGithubAppClick}
                          isSelected={optimisticSelectedGHApp.githubAppId === ghApp.appId}
                          isPending={optimisticSelectedGHApp.isPending && optimisticSelectedGHApp.githubAppId === ghApp.appId}
                        />
                      ),
                    )
                  : (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Unable to get github app.
                      </p>
                    )}
              </div>
            </ScrollArea>
          )
        : null}
    </section>
  );
}

interface DeploymentGithubAppProps {
  githubApp: GithubApp;
  isSelected: boolean;
  isPending: boolean;
  handleGithubAppClick: (githubAppId: number) => void;
}

function GithubAppCard({ githubApp, isSelected, isPending, handleGithubAppClick }: DeploymentGithubAppProps) {
  return (
    <motion.section
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 1.01 }}
      className="cursor-pointer"
      data-testid={`${githubApp.appId}-ghapp-card`}
      onClick={() => handleGithubAppClick(githubApp.appId)}
    >
      <Card className={`overflow-hidden relative ${isSelected && "border-primary"}`}>
        <CardHeader>
          <div className="absolute p-1 top-0 left-0 bg-primary">
            {isPending ? <Loader2 className="animate-spin h-3 w-3 stroke-secondary" /> : <GithubSVG />}
          </div>
          <div>
            <CardTitle>
              {githubApp.name}
            </CardTitle>
            <CardDescription>Github app</CardDescription>
          </div>

        </CardHeader>
      </Card>
    </motion.section>
  );
}

function GithubSVG() {
  return (
    <svg className="fill-secondary/75 w-3" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
