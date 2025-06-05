"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Suspense } from "react";

import { WithBannerBadge } from "@/app/_components/banner";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { ApplicationScreenshotImageSource } from "../../_lib/queries";

export function ApplicationScreenshot() {
  return (
    <WithBannerBadge
      badgeText="preview"
      className="col-span-4 md:col-span-1 lg:col-span-2 2xl:col-span-1"
    >
      <Suspense fallback={<ApplicationScreenshotTemplate isPending={true} />}>
        <ApplicationScreenPreviewWithData />
      </Suspense>
    </WithBannerBadge>
  );
}

function ApplicationScreenPreviewWithData() {
  const params = useParams<{ name: string }>();
  const { fetcher } = useFetch();
  const { data: appPreviewImgSrc } = useSuspenseQuery<ApplicationScreenshotImageSource>({
    queryKey: ["applications", "screenshot"],
    queryFn: () => fetcher(`/api/applications/${params.name}/screenshot`),
  });

  if (!appPreviewImgSrc)
    return null;

  return (
    <Image
      width={1920}
      height={1080}
      src={appPreviewImgSrc}
      alt="Screenshot of the first rendering ui of your application"
      className="w-full h-full rounded-xl"
    />
  );
}

interface ApplicationDetailsTemplateProps {
  isPending?: boolean;
  appPreviewImgSrc?: string;
}

function ApplicationScreenshotTemplate({ isPending, appPreviewImgSrc }: ApplicationDetailsTemplateProps) {
  return isPending
    ? <PendingApplicationScreenshot />
    : (
        <Image
          width={1920}
          height={1080}
          src={appPreviewImgSrc || ""}
          alt="Screenshot of the first rendering ui of your application"
          className="w-full h-full rounded-xl"
        />
      )
  ;
}

function PendingApplicationScreenshot() {
  return (
    <Skeleton className="flex justify-center items-center rounded-xl h-full w-full bg-secondary col-span-4 md:col-span-1 lg:col-span-2 2xl:col-span-1">
      <p>Screenshot in progress...</p>
    </Skeleton>
  );
}
