"use client";

import { Loader2, Rocket } from "lucide-react";
import { useActionState, useState } from "react";

import type { GithubApp, GithubRepositories } from "@/app/_lib/github/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ActionState } from "../_lib/form-middleware";
import type { SelectedRepositoryProps } from "./deployment-repositories";

import { deploy } from "../actions";
import { DeploymentGithubAppList } from "./deployment-github-apps";
import { DeploymentRepositories } from "./deployment-repositories";

interface DeploymentProps {
  repositories: GithubRepositories;
  githubApps: GithubApp[];
  isOnboarding?: boolean;
}

export function DeploymentForm({ repositories, githubApps, isOnboarding = false }: DeploymentProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deploy, {
    error: "",
    inputs: {
      port: "",
      env: "",
      cache: true,
    },
  });
  const [selected, setSelected] = useState<SelectedRepositoryProps>({
    name: null,
    id: null,
    githubAppId: null,
    gitUrl: null,
  });

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
          <div className="grid grid-cols-4 gap-4">
            <DeploymentGithubAppList githubApps={githubApps} />
            <DeploymentRepositories githubApp={repositories.githubApp} repositories={repositories} selected={selected} setSelected={setSelected} />
          </div>

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
