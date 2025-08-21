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
import { roboto } from "../font";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

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
    <div
      className={`${roboto.className} p-4 flex items-center gap-4 border mb-2 text-xs bg-linear-to-r from-sky-400 to-sky-300 text-primary-foreground relative`}
      data-testid="version-upgrade-card"
    >
      <span className={`absolute top-0 bg-secondary text-secondary-foreground px-2 py-1 ${data.isLatest ? "right-0" : "left-0"} rounded-bl-lg rounded-tr-lg italic`}>
        {data.version}
      </span>
      <div className="flex items-center gap-2">
        {
          isPending || data.isInProgress
            ? <Spinner variant="secondary" className="mr-2" />
            : <CircleFadingArrowUp size={22} />
        }
        <Separator orientation="vertical" className="h-6" />
        {data.isInProgress
          ? <p>Updating...</p>
          : data.isLatest
            ? <p>Already up to date</p>
            : (
                <div className="flex flex-col gap-2">
                  <p>New version is available</p>
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

      </div>
    </div>
  );
}

function PendingVersionUpgrade() {
  return <Skeleton className="h-20 w-full" />;
}
