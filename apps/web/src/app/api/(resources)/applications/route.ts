import { getApplications } from "@/app/(dashboard)/dashboard/(resources)/applications/_lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const applications = await getApplications();
  return Response.json(applications);
}
