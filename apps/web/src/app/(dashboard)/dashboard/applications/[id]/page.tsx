import { Skeleton } from "@/components/ui/skeleton";
import { getApplicationById } from "@/lib/application/queries";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppForm } from "./_components/app-form";

function GetApplicationLoadingScreen() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const application = await getApplicationById(id);

  if (!application) redirect("/dashboard/applications");

  const rawEnvs = application.environmentVariables?.map(({ key, value }) => `${key}=${value}`).filter(rawEnv => !(rawEnv.length <= 1)).join(" ");

  return (
    <section className="p-5 bg-background/50">
      <h1 className="text-2xl underline decoration-primary underline-offset-4">Application configuration</h1>
      <Suspense fallback={<GetApplicationLoadingScreen />}>
        <AppForm
          fqdn={application.fqdn}
          port={application.port}
          environmentVariables={rawEnvs}
          id={application.id}
        />
      </Suspense>
    </section>
  );
}
