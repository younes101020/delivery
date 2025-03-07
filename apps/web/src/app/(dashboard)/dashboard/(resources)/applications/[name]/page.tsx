import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { WithBannerBadge } from "@/app/_components/banner";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { formatDate } from "@/app/_lib/utils";

import { getApplicationByName, getApplicationSreenshotUrl } from "../_lib/queries";
import { AppForm } from "./_components/app-form";
import DeleteAppForm from "./_components/delete-app-form";

interface ApplicationPageProps {
  params: Promise<{ name: string }>;
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const appName = (await params).name;

  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Application configuration</PageTitle>
      <div className="mt-8 grid grid-cols-4 gap-4">
        <Suspense
          fallback={(
            <Skeleton className="flex justify-center items-center rounded-xl h-full w-full bg-secondary col-span-4 md:col-span-1 lg:col-span-2 2xl:col-span-1">
              <p>Screenshot in progress...</p>
            </Skeleton>
          )}
        >
          <AppPreviewImage name={appName} />
        </Suspense>
        <Suspense
          fallback={
            <Skeleton className="rounded-xl col-span-4 md:col-span-3 lg:col-span-2 2xl:col-span-3" />
          }
        >
          <AppDetails name={appName} />
        </Suspense>

        <div className="col-span-4 mt-4">
          <h2 className="text-xl font-bold mb-2">Update application details</h2>
          <Suspense fallback={<GetApplicationLoadingScreen />}>
            <AppConfiguration name={appName} />
          </Suspense>
          <div className="p-3 text-destructive border border-dashed border-destructive">
            <h3 className="text-lg font-bold mb-4">Danger zone</h3>
            <DeleteAppForm name={appName} />
          </div>
        </div>
      </div>
    </section>
  );
}

interface AppProps {
  name: string;
}

async function AppPreviewImage({ name }: AppProps) {
  const appPreviewImg = await getApplicationSreenshotUrl(name);
  if (!appPreviewImg)
    return null;

  return (
    <WithBannerBadge
      badgeText="preview"
      className="col-span-4 md:col-span-1 lg:col-span-2 2xl:col-span-1"
    >
      <Image
        width={1920}
        height={1080}
        src={appPreviewImg}
        alt="Screenshot of the first rendering ui of your application"
        className="w-full h-full rounded-xl"
      />
    </WithBannerBadge>
  );
}

async function AppDetails({ name }: AppProps) {
  const application = await getApplicationByName(name);
  if (!application)
    redirect("/dashboard/applications");

  return (
    <div className="text-xs col-span-4 md:col-span-3 lg:col-span-2 2xl:col-span-3 space-y-2">
      <dl>
        <dt className="text-muted-foreground">Application name</dt>
        <dd>{application.name}</dd>
      </dl>
      <dl>
        <dt className="text-muted-foreground">Fully qualified domain name</dt>
        <dd className="underline">
          <a href={`http://${application.fqdn}`} target="_blank" rel="noopener noreferrer">
            {application.fqdn}
          </a>
        </dd>
      </dl>
      <dl>
        <dt className="text-muted-foreground">Port</dt>
        <dd>{application.port}</dd>
      </dl>
      <dl>
        <dt className="text-muted-foreground">Environment variables count</dt>
        <dd>{application.environmentVariable?.length || 0}</dd>
      </dl>
      <dl>
        <dt className="text-muted-foreground">Creation date</dt>
        <dd>{formatDate(application.createdAt)}</dd>
      </dl>
      <dl>
        <dt className="text-muted-foreground">Last updated</dt>
        <dd>{formatDate(application.updatedAt)}</dd>
      </dl>
    </div>
  );
}

async function AppConfiguration({ name }: AppProps) {
  const application = await getApplicationByName(name);
  if (!application)
    redirect("/dashboard/applications");
  const rawEnvs = application.environmentVariable
    ?.map(({ key, value }) => `${key}=${value}`)
    .filter(rawEnv => !(rawEnv.length <= 1))
    .join(" ");

  return (
    <AppForm
      fqdn={application.fqdn}
      port={application.port}
      environmentVariables={rawEnvs}
      name={application.name}
    />
  );
}

function GetApplicationLoadingScreen() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
