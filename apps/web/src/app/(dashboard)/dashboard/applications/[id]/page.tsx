import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { roboto } from "@/app/layout";
import { WithBannerBadge } from "@/components/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

import { getApplicationById, getApplicationSreenshotUrl } from "../_lib/queries";
import { AppForm } from "./_components/app-form";
import DeleteAppForm from "./_components/delete-app-form";

interface AppProps {
  id: string;
}

async function AppPreviewImage({ id }: AppProps) {
  const appPreviewImg = await getApplicationSreenshotUrl(Number.parseInt(id));
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

async function AppDetails({ id }: AppProps) {
  const application = await getApplicationById(id);
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

async function AppConfiguration({ id }: AppProps) {
  const application = await getApplicationById(id);
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
      id={application.id}
    />
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  if (!Number.parseInt(id))
    redirect("/dashboard/applications");

  return (
    <section className="p-5 bg-background/50 border">
      <h1 className={`text-3xl font-bold tracking-wide leading-none ${roboto.className} italic bg-primary text-primary-foreground px-2 py-1 w-fit`}>Application configuration</h1>
      <div className="mt-8 grid grid-cols-4 gap-4">
        <Suspense
          fallback={(
            <Skeleton className="flex justify-center items-center rounded-xl h-full w-full bg-secondary col-span-4 md:col-span-1 lg:col-span-2 2xl:col-span-1">
              <p>Screenshot in progress...</p>
            </Skeleton>
          )}
        >
          <AppPreviewImage id={id} />
        </Suspense>
        <Suspense
          fallback={
            <Skeleton className="rounded-xl col-span-4 md:col-span-3 lg:col-span-2 2xl:col-span-3" />
          }
        >
          <AppDetails id={id} />
        </Suspense>

        <div className="col-span-4 mt-4">
          <h2 className="text-xl font-bold mb-2">Update application details</h2>
          <Suspense fallback={<GetApplicationLoadingScreen />}>
            <AppConfiguration id={id} />
          </Suspense>
          <div className="p-3 text-destructive border border-dashed border-destructive">
            <h3 className="text-lg font-bold mb-4">Danger zone</h3>
            <DeleteAppForm id={id} />
          </div>
        </div>
      </div>
    </section>
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
