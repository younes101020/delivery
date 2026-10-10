import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

export default function HubPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>New application</PageTitle>
      <PageDescription>A list of several million containers installable with one click.</PageDescription>
    </section>
  );
}
