"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";

import { ChevronLast, Loader2, Rocket } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

import type { ActionState } from "../_lib/form-middleware";

import { useDeploymentSelectedApplication } from "../_ctx/deployment-selected-application";
import { deploy, skipOnboardingDeployment } from "../actions";
import { Paragraph } from "./ui/paragraph";
import { Textarea } from "./ui/textarea";

interface DeploymentProps {
  isOnboarding?: boolean;
  children?: React.ReactNode;
}

export function DeploymentForm({ isOnboarding = false, children }: DeploymentProps) {
  const initialStaticChoice = false;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deploy, {
    error: "",
    inputs: {
      port: "",
      env: "",
      cache: true,
      staticdeploy: initialStaticChoice,
    },
  });
  const [_, skipDeploymentFormAction, skipDeploymentPending] = useActionState<ActionState, FormData>(skipOnboardingDeployment, {
    error: "",
    inputs: {},
  });
  const { selectedApplication } = useDeploymentSelectedApplication();
  const [isStaticDeployment, setIsStaticDeployment] = useState<CheckedState>(initialStaticChoice);

  return (
    <>
      <form action={formAction} className="px-5 space-y-8 mt-8" aria-label="form">

        {isStaticDeployment
          ? (
              <div>
                <Label htmlFor="publishdir" className="block text-sm font-medium">
                  Publish directory
                </Label>
                <div className="mt-1">
                  <Input
                    id="publishdir"
                    name="publishdir"
                    type="text"
                    required={isStaticDeployment !== "indeterminate"}
                    defaultValue={state.inputs.publishdir}
                    className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
                    placeholder="ex: /dist"
                  />
                </div>
                <p className="text-muted-foreground text-xs pt-1">
                  The output directory of your build
                </p>
              </div>
            )
          : (
              <div>
                <Label htmlFor="port" className="block text-sm font-medium">
                  Running port
                </Label>
                <div className="mt-1">
                  <Input
                    id="port"
                    name="port"
                    type="text"
                    required={!isStaticDeployment}
                    defaultValue={state.inputs.port}
                    className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
                    placeholder="ex: 3000"
                  />
                </div>
                <p className="text-muted-foreground text-xs pt-1">
                  Port on which your application runs.
                </p>
              </div>
            )}

        <div>
          <Label htmlFor="env" className="block">
            Environment variables
          </Label>
          <div className="mt-1">
            <Textarea
              id="env"
              name="env"
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
          {children}
        </div>
        <p className="text-muted-foreground text-xs">
          This GitHub repository will be the source of your application.
        </p>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="staticdeploy"
              name="staticdeploy"
              defaultChecked={!!(state.inputs.staticdeploy === "on" || state.inputs.staticdeploy)}
              key={state.inputs.staticdeploy}
              onCheckedChange={isChecked => setIsStaticDeployment(isChecked)}
            />
            <div className="flex flex-col">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Build and serve static files
              </label>
              <p className="block text-xs text-muted-foreground">
                Your source code will be built, and the output static files will be served via Nginx
              </p>
            </div>
          </div>
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
        </div>

        <div className={`flex ${state.error ? "justify-between" : "justify-end"}`}>
          <input type="hidden" name="repoUrl" id="repoUrl" value={selectedApplication.gitUrl ?? "no-url"} />
          <input
            type="hidden"
            name="githubAppId"
            id="githubAppId"
            value={selectedApplication.githubAppId ?? "no-github-app-id"}
          />
          {isOnboarding && (
            <input type="hidden" name="isOnboarding" id="isOnboarding" value="true" />
          )}
          {state?.error && (
            <Paragraph variant="error">
              {state.error}
            </Paragraph>
          )}
          <div className="flex gap-2">
            {isOnboarding && (
              <Button
                type="submit"
                variant="outline"
                disabled={pending}
                formAction={skipDeploymentFormAction}
              >
                {skipDeploymentPending
                  ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Loading...
                      </>
                    )
                  : (
                      <>
                        <ChevronLast />
                        {" "}
                        | Skip
                      </>
                    )}
              </Button>
            )}

            <Button type="submit" disabled={!selectedApplication.name || pending} aria-label="submit">
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

        </div>
      </form>
    </>
  );
}
