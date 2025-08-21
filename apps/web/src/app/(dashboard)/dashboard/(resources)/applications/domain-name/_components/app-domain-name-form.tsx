"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useUser } from "@/app/_hooks/use-user";
import { useFetch } from "@/app/_lib/fetch-provider";
import { withToast } from "@/app/_lib/utils";

import type { ApplicationsDomainConfiguration } from "../_lib/queries";

import { applicationDomainForm } from "../actions";

interface ApplicationDomainConfigurationFormProps {
  wildcardDomain?: string;
  error?: string;
}

export function ApplicationDomainConfigurationForm() {
  return (
    <Suspense fallback={<FormPending />}>
      <Form />
    </Suspense>
  );
}

function Form() {
  const { user } = useUser();
  const [state, formAction, pending] = useActionState<ActionState<ApplicationDomainConfigurationFormProps>, FormData>(
    withToast(applicationDomainForm),
    {
      error: "",
      success: "",
      inputs: {
        wildcardDomain: "",
      },
    },
  );
  const { fetcher } = useFetch();
  const applicationsDomainConfiguration = useSuspenseQuery<ApplicationsDomainConfiguration>({
    queryKey: ["application-domain-configuration"],
    queryFn: () => fetcher("/api/application-domain-configuration"),
  });

  return (
    <div className="col-span-3 lg:col-span-2 w-full">
      {applicationsDomainConfiguration.data
      && (
        <form className="flex flex-col gap-4 pt-4" action={formAction} aria-label="form">
          <div>
            <p className="bg-secondary text-secondary-foreground w-fit px-2 text-sm truncate">step 1: Specify your wildcard domain</p>
            <Separator className="mt-2" />
            <Label htmlFor="wildcardDomain">Wildcard domain</Label>
            <Input
              disabled={user.role !== "owner"}
              id="wildcardDomain"
              name="wildcardDomain"
              type="text"
              aria-label="wildcard domain, will be created automatically for each application."
              placeholder="mywildcarddomain.com"
              defaultValue={state.inputs.wildcardDomain || applicationsDomainConfiguration.data?.wildcardDomain}
              className="rounded-r-none"
            />
            <p className="text-muted-foreground text-xs pt-2">
              If specified, this domain will be used as a wildcard domain for all your applications.
            </p>
          </div>
          {user.role === "owner" && (
            <CardFooter className="flex px-0 pt-8 col-span-2">
              <Button type="submit" disabled={pending} aria-label="submit" className="w-full">
                {pending
                  ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Loading...
                      </>
                    )
                  : (
                      "Save"
                    )}
              </Button>
            </CardFooter>
          )}

        </form>
      )}
    </div>

  );
}

function FormPending() {
  return (
    <div>
      <Label htmlFor="wildcard">Wildcard domain</Label>
      <Skeleton className="h-10 w-full rounded-r-none" />
      <Skeleton className="h-4 w-1/3 mt-2" />
    </div>

  );
}
