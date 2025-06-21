import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Team configurations</PageTitle>
      <PageDescription>Manage your team members.</PageDescription>

      <div className="mt-8 flex flex-col gap-8">

      </div>
    </section>
  );
}
