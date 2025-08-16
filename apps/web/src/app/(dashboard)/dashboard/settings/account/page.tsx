import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Separator } from "@/app/_components/ui/separator";
import { roboto } from "@/app/font";

import { AccountForm } from "./_components/account-form";
import { SecurityForm } from "./_components/security-form";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Account Details</PageTitle>
      <PageDescription>Account related informations.</PageDescription>

      <div className="mt-8 flex flex-col gap-8">
        <div>
          <h2 className={`${roboto.className} text-lg py-2`}>Update account</h2>
          <Separator className="mb-4" />
          <AccountForm />
        </div>
        <Separator className="my-2" />
        <div>
          <h2 className={`${roboto.className} text-lg py-2`}>Security settings</h2>
          <Separator className="mb-4" />
          <SecurityForm />
        </div>
      </div>
    </section>
  );
}
