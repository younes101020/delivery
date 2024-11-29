import { GithubAppForm } from "./_components/github-app-form";
import { Login } from "./_components/login-form";
import { StepProvider } from "./_components/step";

export default async function Onboarding() {
  return (
    <div className="flex justify-center items-center h-[95vh]">
      <StepProvider>
        <Login />
        <GithubAppForm />
      </StepProvider>
    </div>
  );
}
