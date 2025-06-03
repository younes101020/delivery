import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";

import type { GithubApp } from "../_lib/github/types";

import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface DeploymentGithubAppsProps {
  githubApps: GithubApp[];
  initialGithubAppId: number;
}

export function DeploymentGithubAppList({ githubApps, initialGithubAppId }: DeploymentGithubAppsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = new URLSearchParams(searchParams);
  const githubAppSearchParam = params.get("githubapp") ? Number.parseInt(params.get("githubapp") as string) : initialGithubAppId;

  const handleGithubAppClick = (appId: number) => {
    params.set("githubapp", `${appId}`);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <ScrollArea>
      <div className="col-span-1 flex flex-col gap-2 max-h-52">
        <Separator />
        {githubApps.map(
          ghApp => (
            <DeploymentGithubApp
              key={ghApp.appId}
              githubApp={ghApp}
              handleGithubAppClick={handleGithubAppClick}
              isSelected={githubAppSearchParam === ghApp.appId}
            />
          ),
        )}
      </div>
    </ScrollArea>

  );
}

interface DeploymentGithubAppProps {
  githubApp: GithubApp;
  isSelected: boolean;
  handleGithubAppClick: (githubAppId: number) => void;
}

function DeploymentGithubApp({ githubApp, isSelected, handleGithubAppClick }: DeploymentGithubAppProps) {
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
            <GithubSVG />
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
