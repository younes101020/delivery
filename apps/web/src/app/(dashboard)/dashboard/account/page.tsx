import { roboto } from "@/app/layout";

import { AccountForm } from "./_components/account-form";
import { SecurityForm } from "./_components/security-form";

export default async function AccountPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <h1 className={`${roboto.className} bg-primary text-primary-foreground tracking-wide leading-none italic text-3xl font-bold px-2 py-1 w-fit`}>Account Details</h1>

      <div className="mt-8 flex flex-col gap-8">
        <div>
          <h2 className={`text-2xl py-2 font-semibold ${roboto.className}`}>Update account</h2>
          <AccountForm />
        </div>
        <div>
          <h2 className={`text-2xl py-2 font-semibold ${roboto.className}`}>Security settings</h2>
          <SecurityForm />
        </div>
      </div>
    </section>
  );
}
