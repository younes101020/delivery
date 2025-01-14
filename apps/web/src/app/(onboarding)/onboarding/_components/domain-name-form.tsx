"use client";

import { Button } from "@/components/ui/button";

import { ActionState } from "@/lib/form-middleware";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { domainName } from "../../../actions";

export function DomainNameForm() {
  const [state, formAction, pending] = useActionState<ActionState<{}>, FormData>(domainName, {
    error: "",
    inputs: {},
  });

  return (
    <>
      <form action={formAction} className="px-5 space-y-4" aria-label="form">
        <div>
          <Label htmlFor="domainName" className="block text-sm font-medium">
            Domain name
          </Label>
          <div className="mt-1">
            <Input
              id="domainName"
              name="domainName"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
              placeholder="ex: http://mydomain.com or http://203.0.113.42"
            />
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            The domain name or public IP that directs to the server where you launched Delivery.
          </p>
        </div>
        {state?.error && <div className="text-destructive text-sm">{state.error}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={pending} aria-label="submit">
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
