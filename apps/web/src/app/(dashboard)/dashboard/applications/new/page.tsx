import { Deployment } from "@/app/_components/deployment";
import { getAllInstallReposForEachRepoPage } from "@/lib/github";

interface ApplicationFormProps {
    searchParamsPromise: Promise<{ page: number }> | undefined;
}

async function ApplicationForm({ searchParamsPromise }: ApplicationFormProps) {
  const searchParams = await searchParamsPromise;
  const githubRepoPage = searchParams && searchParams.page;
  const installations = await getAllInstallReposForEachRepoPage(githubRepoPage ?? 1);
  if (!installations) return <p className="mt-5">No repository found</p>;
  return <Deployment installations={installations} />;
}

export default function NewApplicationPage(props: {
    searchParams?: Promise<{ page: number }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <h1 className="text-3xl font-bold bg-primary text-primary-foreground px-2 py-1 w-fit mx-5">New application</h1>
      <ApplicationForm searchParamsPromise={props.searchParams} />
    </section>
  );
}
