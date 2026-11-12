import { apiHandlers } from "@/app/_lib/api-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return apiHandlers.getApplicationsStream();
}
