import { DeploymentSelectedApplicationProvider } from "../_ctx/deployment-selected-application";
import { ApplicationSource } from "./deployment-applications-source";
import { DeploymentForm } from "./deployment-form";

interface DeploymentProps {
  sp: Promise<{
    page: string;
    githubapp?: string;
    step?: string;
    query?: string;
  } | undefined>;
  onboarding?: boolean;
}

export async function Deployment({ sp, onboarding = false }: DeploymentProps) {
  const searchParams = await sp;

  if (onboarding) {
    const onboardingStep = searchParams && searchParams.step ? Number.parseInt(searchParams.step) : null;
    if (onboardingStep !== 4) {
      return null;
    }
  }

  return (
    <DeploymentSelectedApplicationProvider>
      <DeploymentForm isOnboarding={onboarding}>
        <ApplicationSource sp={sp} />
      </DeploymentForm>
    </DeploymentSelectedApplicationProvider>
  );
}
