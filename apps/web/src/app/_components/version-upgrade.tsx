"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleFadingArrowUp } from "lucide-react";
import { Suspense } from "react";

import type { DeliveryVersion } from "../_lib/jobs/queries";

import { useFetch } from "../_lib/fetch-provider";
import { roboto } from "../font";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

export function VersionUpgrade() {
  return (
    <Suspense fallback={<PendingVersionUpgrade />}>
      <VersionUpgradeCard />
    </Suspense>
  );
}

function VersionUpgradeCard() {
  const { fetcher } = useFetch();
  const { data } = useSuspenseQuery<DeliveryVersion>({
    queryKey: ["version"],
    queryFn: () => fetcher("/api/version"),
  });

  if (!data) {
    return null;
  }

  return (
    <div className={`${roboto.className} p-4 flex items-center gap-4 bg-secondary border mb-2 text-xs border-green-500`}>
      <div className="flex items-center gap-2">
        <CircleFadingArrowUp size={15} />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex flex-col gap-1">
          <p>Delivery {data.version}</p>
        <Separator />
        <Button size={"sm"}>update</Button>
        </div>
        
      </div>
    </div>
  );
}

function PendingVersionUpgrade() {
  return (
    <Skeleton className="h-32 w-full" />
  );
}
