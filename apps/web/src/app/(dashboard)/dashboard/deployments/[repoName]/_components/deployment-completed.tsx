"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";

export function FinishDeployment() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 items-start">
      <h3>Deployment Finished</h3>
      <Separator />
      <Button variant="outline" onClick={() => router.push(`/dashboard/applications`)}>
        Go to applications list
      </Button>
    </div>
  );
}
