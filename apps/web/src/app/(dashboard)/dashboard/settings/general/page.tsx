import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { roboto } from "@/app/font";

export default async function GeneralPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>General configurations</PageTitle>
      <PageDescription>Manage configurations related to your delivery instance.</PageDescription>

      <div className={`mt-8 flex flex-col gap-8 ${roboto.className}`}>

      </div>
    </section>
  );
}
