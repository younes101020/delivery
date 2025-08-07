import { getApplicationByName } from "@/app/(dashboard)/dashboard/(resources)/applications/_lib/queries";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{
    name: string;
  }>;
}

export async function GET(_: Request, { params }: Params) {
  const application = await getApplicationByName(params);
  return Response.json(application);
}
