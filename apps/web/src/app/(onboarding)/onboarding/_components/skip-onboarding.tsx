"use client";

import { ChevronLast, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { skipOnboardingDeployment } from "@/app/actions";

import { useOnboardingDictionary } from "./onboarding-dictionary";

export function SkipOnboardingForm() {
  const onboarding = useOnboardingDictionary();
  return (
    <form action={skipOnboardingDeployment} aria-label={onboarding.skip.formLabel}>
      <SubmitButton action={onboarding.skip.action} loading={onboarding.skip.loading} />
    </form>
  );
}

function SubmitButton({ action, loading }: { action: string; loading: string }) {
  const { pending: skipDeploymentPending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={skipDeploymentPending}
    >
      {skipDeploymentPending
        ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              {loading}
            </>
          )
        : (
            <>
              <ChevronLast />
              {" "}
              <Separator orientation="vertical" />
              {" "}
              {action}
            </>
          )}
    </Button>
  );
}
