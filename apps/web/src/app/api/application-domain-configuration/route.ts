import { getApplicationsDomainConfiguration } from "@/app/(dashboard)/dashboard/(resources)/applications/domain-name/_lib/queries";

export async function GET() {
  const applicationsDomainConfiguration = await getApplicationsDomainConfiguration();
  return Response.json(applicationsDomainConfiguration);
}
