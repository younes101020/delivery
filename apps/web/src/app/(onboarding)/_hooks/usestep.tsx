import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UseStepActions = {
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
  canGoToNextStep: boolean;
  canGoToPrevStep: boolean;
  setStep: (step: number | ((step: number) => number)) => void;
};

export function useStep(maxStep: number): [number, UseStepActions] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = Number(searchParams.get("step") || "1");

  const canGoToNextStep = currentStep + 1 <= maxStep;
  const canGoToPrevStep = currentStep - 1 > 0;

  const setStep = useCallback(
    (step: number | ((step: number) => number)) => {
      const newStep = typeof step === "function" ? step(currentStep) : step;

      if (newStep >= 1 && newStep <= maxStep) {
        const params = new URLSearchParams(searchParams);
        params.set("step", newStep.toString());
        router.push(`?${params.toString()}`);
        return;
      }

      throw new Error("Step not valid");
    },
    [maxStep, currentStep, router, searchParams]
  );

  const goToNextStep = useCallback(() => {
    if (canGoToNextStep) {
      setStep((step) => step + 1);
    }
  }, [canGoToNextStep, setStep]);

  const goToPrevStep = useCallback(() => {
    if (canGoToPrevStep) {
      setStep((step) => step - 1);
    }
  }, [canGoToPrevStep, setStep]);

  const reset = useCallback(() => {
    setStep(1);
  }, [setStep]);

  return [
    currentStep,
    {
      goToNextStep,
      goToPrevStep,
      canGoToNextStep,
      canGoToPrevStep,
      setStep,
      reset,
    },
  ];
}
