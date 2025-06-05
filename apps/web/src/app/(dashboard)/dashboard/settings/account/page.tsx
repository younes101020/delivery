import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

import { AccountForm } from "./_components/account-form";
import { SecurityForm } from "./_components/security-form";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Account Details</PageTitle>
      <PageDescription>Account related informations.</PageDescription>

      <div className="mt-8 flex flex-col gap-8">
        <AccountForm />
        <div>
          <h2 className="text-2xl py-2">Security settings</h2>
          <SecurityForm />
        </div>
      </div>
    </section>
  );
}
