import { LoginForm } from "@/app/(login)/_components/login-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background bg-[linear-gradient(to_right,rgba(188,185,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(188,185,184,0.1)_1px,transparent_1px)] bg-size-[24px_24px] p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm mode="signup" />
      </div>
    </div>
  );
}
