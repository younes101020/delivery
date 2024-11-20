"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useStep } from "../_hooks/usestep";
import { Login } from "./loginform";
import { StepTracker } from "./stepstracker";

type StepMapper = {
  [key: number]: React.ReactNode;
};

const ALL_STEPS_COMPONENT: StepMapper = {
  1: <Login mode="signup" />,
};

export function OnboardingForms() {
  const [currentStep, helpers] = useStep(3);
  const CurrentComponent = ALL_STEPS_COMPONENT[currentStep];

  const {
    canGoToPrevStep,
    canGoToNextStep,
    goToNextStep,
    goToPrevStep,
    reset,
    setStep,
  } = helpers;

  return (
    <Card className="w-[90%] lg:w-[60%]">
      <StepTracker />
      <CardContent>{CurrentComponent}</CardContent>
    </Card>
  );
}
