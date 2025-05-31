import { getApplications } from "@/app/(dashboard)/dashboard/(resources)/applications/_lib/queries";
import { getActiveDatabaseServices } from "@/app/(dashboard)/dashboard/(resources)/databases/_lib/queries";

export async function GET() {
  return Response.json(
    await Promise.all([
      getApplications(),
      getActiveDatabaseServices(),
    ]),
  );
}
