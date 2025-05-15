"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Paragraph } from "@/app/_components/ui/paragraph";

import { deliveryInstanceForm } from "../actions";

interface DeliveryInstanceFormProps {
  fqdn?: string;
  name?: string;
}

export function DeliveryInstanceForm(props: DeliveryInstanceFormProps) {
  const [state, formAction, pending] = useActionState<ActionState<DeliveryInstanceFormProps>, FormData>(
    deliveryInstanceForm,
    {
      error: "",
      success: "",
      inputs: props,
    },
  );

  return (
    <form className="w-full flex flex-col gap-4 pt-4" action={formAction} aria-label="form">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          aria-label="name"
          placeholder="My application dashboard"
          defaultValue={state.inputs?.name}
          className="rounded-r-none"
        />
        <p className="text-muted-foreground text-xs pt-2">
          The name of your delivery instance.
        </p>
      </div>
      <div>
        <Label htmlFor="fqdn">Domain name</Label>
        <Input
          id="fqdn"
          name="fqdn"
          type="text"
          aria-label="name"
          placeholder="mysuperappdashboard.com"
          className="rounded-r-none"
          defaultValue={state.inputs?.fqdn}
        />
        <p className="text-muted-foreground text-xs pt-2">
          The domain name of your application. This is the name that will be used to access your application.
        </p>
      </div>
      {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}

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
    </form>
  );
}
