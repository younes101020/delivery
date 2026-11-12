import { apiHandlers } from "@/app/_lib/api-handlers";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{
    name: string;
  }>;
}

export async function GET(_: Request, { params }: Params) {
  return apiHandlers.getApplicationByName(_, { params });
}
