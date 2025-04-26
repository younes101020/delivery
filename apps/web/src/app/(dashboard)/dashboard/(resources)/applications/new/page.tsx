import { Deployment } from "@/app/_components/deployment";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

export default function NewApplicationPage(props: {
  searchParams?: Promise<{ page: string }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>New application</PageTitle>
      <PageDescription>Start deploying your new application from here.</PageDescription>

      <Deployment sp={props.searchParams} />
    </section>
  );
}
