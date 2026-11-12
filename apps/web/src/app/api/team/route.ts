import { apiHandlers } from "@/app/_lib/api-handlers";

export async function GET() {
  return apiHandlers.getTeam();
}
