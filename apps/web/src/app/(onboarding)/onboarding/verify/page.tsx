import type { Metadata } from "next";

import Link from "next/link";

import { Login } from "@/app/_components/login-form";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/_components/ui/card";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

export const metadata: Metadata = {
  title: "Wait a moment",
  description: "You need to verify your identity to continue the process.",
};

interface VerifyProps {
  redirectTo: string;
}

export default async function Verify({
  searchParams,
}: {
  searchParams: Promise<VerifyProps>;
}) {
  const redirectTo = (await searchParams).redirectTo;
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <PageTitle className="text-xl">Wait a minute</PageTitle>
          <PageDescription className="text-sm">Enter your credentials to continue process</PageDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Login mode="signin" redirectTo={redirectTo} />
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-xs">
            Dont have an account?
            {" "}
            <Link
              href="/onboarding"
              className="underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
