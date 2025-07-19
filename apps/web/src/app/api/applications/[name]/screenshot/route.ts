import { getApplicationSreenshotUrl } from "@/app/(dashboard)/dashboard/(resources)/applications/_lib/queries";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{
    name: string;
  }>;
}

export async function GET(_: Request, { params }: Params) {
  const appPreviewImg = await getApplicationSreenshotUrl({ params });
  return Response.json(appPreviewImg);
}
