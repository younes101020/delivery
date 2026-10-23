"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { withToast } from "@/app/_lib/utils";
import { domainName } from "@/app/actions";

import { useOnboardingDictionary } from "./onboarding-dictionary";

interface DomainNameState {
  domainName: string;
}

export function DomainNameForm() {
  const onboarding = useOnboardingDictionary();
  const [_, formAction, pending] = useActionState<ActionState<DomainNameState>, FormData>(
    withToast(domainName),
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
            {onboarding.domain.label}
          </Label>
          <div className="mt-1">
            <Input
              id="domainName"
              name="domainName"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
              placeholder={onboarding.domain.placeholder}
            />
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            {onboarding.domain.help}
          </p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending} aria-label={onboarding.domain.submitLabel}>
            {pending
              ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {onboarding.loading}
                  </>
                )
              : (
                  onboarding.domain.next
                )}
          </Button>
        </div>
      </form>
    </>
  );
}
