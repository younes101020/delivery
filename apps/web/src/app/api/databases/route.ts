import { getDatabaseService } from "@/app/(dashboard)/dashboard/(resources)/databases/_lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbServices = await getDatabaseService();
  return Response.json(dbServices);
}
