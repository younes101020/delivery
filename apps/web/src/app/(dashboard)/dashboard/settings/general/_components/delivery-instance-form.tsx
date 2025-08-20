"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useUser } from "@/app/_hooks/use-user";
import { useFetch } from "@/app/_lib/fetch-provider";
import { withToast } from "@/app/_lib/utils";

import type { DeliveryWebInstanceConfiguration } from "../_lib/queries";

import { deliveryInstanceForm } from "../actions";

interface DeliveryInstanceFormProps {
  fqdn?: string;
  name?: string;
  serviceId: string;
  error?: string;
}

export function DeliveryInstanceForm() {
  return (
    <div className="w-full">
      <Suspense fallback={<FormPending />}>
        <Form />
      </Suspense>
    </div>
  );
}

function Form() {
  const { user } = useUser();
  const [state, formAction, pending] = useActionState<ActionState<DeliveryInstanceFormProps>, FormData>(
    withToast(deliveryInstanceForm),
    {
      error: "",
      success: "",
      inputs: {
        serviceId: "",
        fqdn: "",
        name: "",
      },
    },
  );
  const { fetcher } = useFetch();
  const deliveryWebInstanceConfiguration = useSuspenseQuery<DeliveryWebInstanceConfiguration>({
    queryKey: ["delivery-instance-configuration"],
    queryFn: () => fetcher("/api/delivery-instance-configuration"),
  });

  return (
    <>
      {deliveryWebInstanceConfiguration.data
      && (
        <form className="w-full flex flex-col gap-4 pt-4" action={formAction} aria-label="form">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              disabled={user.role !== "owner"}
              id="name"
              name="name"
              type="text"
              aria-label="delivery dashboard instance name"
              placeholder="My application dashboard"
              defaultValue={state.inputs.name || deliveryWebInstanceConfiguration.data?.name}
              className="rounded-r-none"
            />
            <p className="text-muted-foreground text-xs pt-2">
              The name of your delivery instance.
            </p>
          </div>
          <div>
            <Label htmlFor="fqdn">Domain name</Label>
            <Input
              disabled={user.role !== "owner"}
              id="fqdn"
              name="fqdn"
              type="text"
              aria-label="domain name"
              placeholder="mysuperappdashboard.com"
              className="rounded-r-none"
              defaultValue={state.inputs.fqdn || deliveryWebInstanceConfiguration.data?.fqdn}
            />
            <p className="text-muted-foreground text-xs pt-2">
              The domain name of your application. This is the fully qualified domain name that will be used to access your application.
            </p>
          </div>
          <input type="hidden" name="serviceId" id="serviceId" defaultValue={state.inputs?.serviceId || deliveryWebInstanceConfiguration.data?.serviceId} />
          {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}
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
    </>

  );
}

function FormPending() {
  return (
    <>
      <div>
        <Label htmlFor="name">Name</Label>
        <Skeleton className="h-10 w-full rounded-r-none" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
      <div>
        <Label htmlFor="fqdn">Domain name</Label>
        <Skeleton className="h-10 w-full rounded-r-none" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </div>
    </>
  );
}
