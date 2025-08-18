"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import { Suspense } from "react";

import { EmptyState } from "@/app/_components/ui/empty-state";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useUser } from "@/app/_hooks/use-user";
import { useFetch } from "@/app/_lib/fetch-provider";
import { formatDate } from "@/app/_lib/utils";

import type { Applications } from "./types";

import { AppCard } from "./app-card";

export function ApplicationList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Suspense fallback={<PendingApplication />}>
        <List />
      </Suspense>
    </div>
  );
}

function List() {
  const { fetcher } = useFetch();
  const apps = useSuspenseQuery<Applications>({
    queryKey: ["applications"],
    queryFn: () => fetcher("/api/applications"),
  });

  if (!apps.data || apps.data.length < 1)
    return <NoApplication />;

  const applications = apps.data;

  return (
    <>
      {applications.map(application => (
        <AppCard
          key={application.id}
          id={application.id}
          name={application.name}
          initialState={application.isActive ? "running" : "stop"}
          firstDeploymentAt={formatDate(application.createdAt) ?? "Unknown"}
        />
      ))}
    </>
  );
}

function NoApplication() {
  const { user } = useUser();

  if (!user)
    return null;

  return (
    <EmptyState
      title="No application"
      description="You can see all your applications here."
      icons={[PackagePlus]}
      action={user.role === "owner"
        ? {
            label: "Deploy application",
            href: "/applications/new",
          }
        : undefined}
    />
  );
}

function PendingApplication() {
  return (
    <Skeleton className="h-60" />
  );
}
