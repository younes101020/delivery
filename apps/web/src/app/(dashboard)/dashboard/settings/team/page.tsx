import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

import { Team } from "./_components/team-form";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Team configurations</PageTitle>
      <PageDescription>Manage your team members.</PageDescription>

      <Team />
    </section>
  );
}
