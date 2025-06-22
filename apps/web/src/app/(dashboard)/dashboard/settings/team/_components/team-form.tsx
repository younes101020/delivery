"use client";

import { Suspense } from "react";

import { Skeleton } from "@/app/_components/ui/skeleton";

export function Team() {
  return (
    <div className="mt-8 flex flex-col gap-8">
      <Suspense fallback={<TeamFormSkeleton />}>
      </Suspense>
    </div>
  );
}

function TeamFormSkeleton() {
  return <Skeleton />;
}
