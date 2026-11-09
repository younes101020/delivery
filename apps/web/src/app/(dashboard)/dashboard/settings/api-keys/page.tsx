import { getDictionary } from "@delivery/i18n/server";
import { notFound } from "next/navigation";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { client } from "@/app/_lib/client-http";
import { getCurrentLocale } from "@/app/_lib/locale";
import { getSession } from "@/app/_lib/session";

import { ApiKeyManager } from "./_components/api-key-manager";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const session = await getSession();
  if (session?.user.role !== "owner")
    notFound();

  const { settings } = await getDictionary(await getCurrentLocale());
  const http = await client();
  const response = await http["api-keys"].$get();

  if (response.status !== 200)
    throw new Error(`Unable to load API keys (${response.status}).`);

  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>{settings.apiKeys.title}</PageTitle>
      <PageDescription>{settings.apiKeys.description}</PageDescription>
      <div className="mt-8">
        <ApiKeyManager initialApiKeys={await response.json()} />
      </div>
    </section>
  );
}
