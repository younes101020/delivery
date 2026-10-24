"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { useDeploymentsDictionary, useResourcesDictionary } from "@/app/_ctx/resources-dictionary";

export function FinishDeployment() {
  const router = useRouter();
  const deployments = useDeploymentsDictionary();
  const { locale } = useResourcesDictionary();

  return (
    <div className="flex flex-col gap-2 items-start">
      <h3>{deployments.finished}</h3>
      <Separator />
      <Button variant="outline" onClick={() => router.push(`/${locale}/dashboard/applications`)}>
        {deployments.goToApplications}
      </Button>
    </div>
  );
}
