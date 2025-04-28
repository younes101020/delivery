"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { domainName } from "@/app/actions";

interface DomainNameState {
  domainName: string;
}

export function DomainNameForm() {
  const [state, formAction, pending] = useActionState<ActionState<DomainNameState>, FormData>(
    domainName,
    {
      error: "",
      inputs: {
        domainName: "",
      },
    },
  );

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
        {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}
        <div className="flex justify-end">
          <Button type="submit" disabled={pending} aria-label="submit">
            {pending
              ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                )
              : (
                  "Next"
                )}
          </Button>
        </div>
      </form>
    </>
  );
}
