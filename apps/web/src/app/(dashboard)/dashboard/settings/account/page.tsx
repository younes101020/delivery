import { getDictionary } from "@delivery/i18n/server";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Separator } from "@/app/_components/ui/separator";
import { getCurrentLocale } from "@/app/_lib/locale";
import { roboto } from "@/app/font";

import { AccountForm } from "./_components/account-form";
import { SecurityForm } from "./_components/security-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { settings } = await getDictionary(await getCurrentLocale());
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>{settings.account.title}</PageTitle>
      <PageDescription>{settings.account.description}</PageDescription>

      <div className="mt-8 flex flex-col gap-8">
        <div>
          <h2 className={`${roboto.className} text-lg py-2`}>{settings.account.updateTitle}</h2>
          <Separator className="mb-4" />
          <AccountForm />
        </div>
        <Separator className="my-2" />
        <div>
          <h2 className={`${roboto.className} text-lg py-2`}>{settings.account.securityTitle}</h2>
          <Separator className="mb-4" />
          <SecurityForm />
        </div>
      </div>
    </section>
  );
}
