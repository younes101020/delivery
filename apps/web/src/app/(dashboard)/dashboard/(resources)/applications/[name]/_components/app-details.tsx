"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";

import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { Application } from "../../_lib/queries";

import { AppDate } from "./app-date";

export function ApplicationDetails() {
  return (
    <Suspense fallback={<ApplicationDetailsTemplate isPending={true} />}>
      <ApplicationDetailsWithData />
    </Suspense>
  );
}

function ApplicationDetailsWithData() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const { fetcher } = useFetch();
  const { data } = useSuspenseQuery<Application>({
    queryKey: ["applications", "details"],
    queryFn: () => fetcher(`/api/applications/${params.name}`),
  });

  if (!data)
    router.push("/dashboard/applications");

  return (
    <ApplicationDetailsTemplate application={data} />
  );
}

function ApplicationDetailsTemplate({ application, isPending = false }: { application?: Application; isPending?: boolean }) {
  return (
    <div className="text-xs w-full col-span-4 lg:col-span-1 flex gap-2">
      <Separator orientation="vertical" />
      <div className="w-full flex flex-col gap-2">
        <h4 className="text-xl tracking-tight">Application detail</h4>
        <Separator />
        <dl>
          <dt className="text-muted-foreground">Application name</dt>
          <dd>{isPending ? <Skeleton className="h-12 w-full" /> : application?.name}</dd>
        </dl>
        <dl>
          <dt className="text-muted-foreground">Fully qualified domain name</dt>
          <dd className="underline">
            {isPending
              ? <Skeleton className="h-12 w-full" />
              : (
                  <a href={`http://${application?.fqdn}`} target="_blank" rel="noopener noreferrer">
                    {application?.fqdn}
                  </a>
                )}
          </dd>
        </dl>
        <dl>
          <dt className="text-muted-foreground">Port</dt>
          <dd>{isPending ? <Skeleton className="h-12 w-full" /> : application?.port}</dd>
        </dl>
        <dl>
          <dt className="text-muted-foreground">Environment variables count</dt>
          <dd>{isPending ? <Skeleton className="h-12 w-full" /> : application?.environmentVariables?.length || 0}</dd>
        </dl>
        {isPending
          ? (
              <dl>
                <dt className="text-muted-foreground">Creation date</dt>
                <Skeleton className="h-12 w-full" />
              </dl>
            )
          : application?.createdAt && (
            <dl>
              <dt className="text-muted-foreground">Creation date</dt>
              <AppDate date={application.createdAt} />
            </dl>
          )}
        {isPending
          ? (
              <dl>
                <dt className="text-muted-foreground">Last updated</dt>
                <Skeleton className="h-12 w-full" />
              </dl>
            )
          : application?.updatedAt && (
            <dl>
              <dt className="text-muted-foreground">Last updated</dt>
              <AppDate date={application.updatedAt} />
            </dl>
          )}
      </div>

    </div>
  );
}
