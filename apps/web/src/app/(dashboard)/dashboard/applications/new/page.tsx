import { Deployment } from "@/app/_components/deployment";
import { PageTitle } from "@/app/_components/ui/page-title";

export default function NewApplicationPage(props: {
  searchParams?: Promise<{ page: string }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>New application</PageTitle>
      <Deployment sp={props.searchParams} />
    </section>
  );
}
