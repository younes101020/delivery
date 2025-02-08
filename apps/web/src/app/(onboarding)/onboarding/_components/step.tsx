"use client";

import type {
  ReactNode,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  Suspense,
  useCallback,
  useContext,
} from "react";

import { Card, CardContent } from "@/components/ui/card";

import { StepsHeader } from "./step-header";

export interface UseStepActionsProps {
  helpers: UseStepActions;
}

export type UseStepActions = {
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
  canGoToNextStep: boolean;
  canGoToPrevStep: boolean;
  setStep: (step: number | ((step: number) => number)) => void;
} & { currentStep?: number };

const StepContext = createContext<UseStepActions | null>(null);

export function useStep(): UseStepActions {
  const context = useContext(StepContext);
  if (context === null) {
    throw new Error("useStep must be used within a StepProvider");
  }
  return context;
}

type SetStepCallbackType = (step: number | ((step: number) => number)) => void;

function BaseStepProvider({ children }: { children: ReactNode }) {
  const maxStep = React.Children.count(children);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = Number(searchParams.get("step") || "1");

  const canGoToNextStep = currentStep + 1 <= maxStep;
  const canGoToPrevStep = currentStep - 1 > 0;

  const setStep = useCallback<SetStepCallbackType>(
    (step) => {
      const newStep = typeof step === "function" ? step(currentStep) : step;

      if (newStep >= 1 && newStep <= maxStep) {
        const params = new URLSearchParams(searchParams);
        params.set("step", newStep.toString());
        router.push(`?${params.toString()}`);
        return;
      }

      throw new Error("Step not valid");
    },
    [maxStep, currentStep, router, searchParams],
  );

  const goToNextStep = useCallback(() => {
    if (canGoToNextStep) {
      setStep(step => step + 1);
    }
  }, [canGoToNextStep, setStep]);

  const goToPrevStep = useCallback(() => {
    if (canGoToPrevStep) {
      setStep(step => step - 1);
    }
  }, [canGoToPrevStep, setStep]);

  const reset = useCallback(() => {
    setStep(1);
  }, [setStep]);

  return (
    <StepContext.Provider
      value={{
        goToNextStep,
        goToPrevStep,
        canGoToNextStep,
        canGoToPrevStep,
        setStep,
        reset,
        currentStep,
      }}
    >
      <Card className="w-full mx-4 mt-4">
        <StepsHeader className="p-10" />
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && index + 1 === currentStep) {
            return <CardContent>{React.cloneElement(child)}</CardContent>;
          }
          return null;
        })}
      </Card>
    </StepContext.Provider>
  );
}

// workaround hoc to prevent https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export function StepProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <BaseStepProvider>{children}</BaseStepProvider>
    </Suspense>
  );
}
