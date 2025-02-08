import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import type { GithubApp } from "../_lib/github/types";

interface DeploymentGithubAppsProps {
  githubApps: GithubApp[];
}

export function DeploymentGithubAppList({ githubApps }: DeploymentGithubAppsProps) {
  return (
    <div className="col-span-1 flex flex-col gap-2">
      {githubApps.map(ghApp => <DeploymentGithubApp key={ghApp.appId} githubApp={ghApp} />)}
    </div>
  );
}

interface DeploymentGithubAppProps {
  githubApp: GithubApp;
}

function DeploymentGithubApp({ githubApp }: DeploymentGithubAppProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = new URLSearchParams(searchParams);
  const githubAppSearchParam = params.get("githubapp");

  const isSelected = githubAppSearchParam ? Number.parseInt(githubAppSearchParam) === githubApp.appId : false;

  const handleGithubAppClick = () => {
    params.set("githubapp", `${githubApp.appId}`);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <motion.section
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 1.01 }}
      className="cursor-pointer"
      data-testid={`${githubApp.appId}-ghapp-card`}
      onClick={handleGithubAppClick}
    >
      <Card className={`overflow-hidden relative ${isSelected && "border-primary"}`}>
        <CardHeader>
          <CardTitle>{githubApp.name}</CardTitle>
        </CardHeader>
      </Card>
    </motion.section>
  );
}
