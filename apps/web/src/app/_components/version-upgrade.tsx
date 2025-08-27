"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleFadingArrowUp } from "lucide-react";
import { Suspense, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";

import type { DeliveryVersion } from "../_lib/jobs/queries";

import { useFetch } from "../_lib/fetch-provider";
import { getQueryClient } from "../_lib/react-query-provider";
import { updateDelivery } from "../actions";
import { PinnedToast } from "./pinned-toast";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function VersionUpgrade() {
  return (
    <Suspense fallback={<PendingVersionUpgrade />}>
      <VersionUpgradeCard />
    </Suspense>
  );
}

function VersionUpgradeCard() {
  const [isPending, startTransition] = useTransition();
  const { fetcher } = useFetch();
  const { data } = useSuspenseQuery<DeliveryVersion>({
    queryKey: ["version"],
    queryFn: () => fetcher("/api/version"),
    refetchInterval: ({ state }) => state.data?.isInProgress ? 5000 : undefined,
  });
  const queryClient = getQueryClient();

  const updateDeliveryWithInvalidation = async () => {
    startTransition(async () => {
      await updateDelivery();
      queryClient.invalidateQueries({ queryKey: ["version"] });
    });
  };

  if (!data) {
    return null;
  }

  return (
    <PinnedToast
      isPending={isPending}
      flag={data.version}
      icon={<CircleFadingArrowUp size={15} className="text-primary" />}
      data-testid="version-upgrade-card"
    >
      {data.isInProgress
        ? <p className="underline decoration-primary underline-offset-4">Updating...</p>
        : data.isLatest
          ? <p className="underline decoration-primary underline-offset-4">Already up to date</p>
          : (
              <div className="flex flex-col gap-2">
                <p className="underline decoration-primary underline-offset-4">New version is available</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="secondary" disabled={isPending}>
                      {isPending ? "Updating..." : "Update"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will update the Delivery instance to the latest version. You can take a look at the latest release notes on the
                        {" "}
                        <a href="https://github.com/younes101020/delivery/releases" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub releases page</a>
                        .
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form action={updateDeliveryWithInvalidation}>
                        <AlertDialogAction type="submit">Update</AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            )}
    </PinnedToast>
  );
}

function PendingVersionUpgrade() {
  return <Skeleton className="h-20 w-full" />;
}
