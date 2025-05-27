"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import { Suspense } from "react";

import { EmptyState } from "@/app/_components/ui/empty-state";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { Databases } from "../_lib/queries";

import { DatabaseCard } from "./database-card";

export function List() {
  return (
    <div className="h-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Suspense fallback={<PendingDatabase />}>
        <DatabaseList />
      </Suspense>
    </div>
  );
}

function DatabaseList() {
  const { fetcher } = useFetch();
  const dbs = useSuspenseQuery<Databases>({
    queryKey: ["databases"],
    queryFn: () => fetcher("/api/databases"),
  });

  if (!dbs.data || dbs.data.length < 1)
    return <NoDatabases />;

  const dbServices = dbs.data;

  return (
    <>
      {dbServices.map(dbService => (
        <DatabaseCard key={dbService.name} {...dbService} />
      ))}
    </>
  );
}

function NoDatabases() {
  return (
    <EmptyState
      title="No databases"
      description="You can see all your databases here."
      icons={[PackagePlus]}
      action={{
        label: "Install database from Hub",
        href: "/databases/hub",
      }}
    />
  );
}

function PendingDatabase() {
  return (
    <Skeleton className="h-60" />
  );
}
