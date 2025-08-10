"use client";

import { ChevronLast, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { skipOnboardingDeployment } from "@/app/actions";

export function SkipOnboardingForm() {
  return (
    <form action={skipOnboardingDeployment} aria-label="skip-onboarding-form">
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
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
              Loading...
            </>
          )
        : (
            <>
              <ChevronLast />
              {" "}
              <Separator orientation="vertical" />
              {" "}
              Skip
            </>
          )}
    </Button>
  );
}
