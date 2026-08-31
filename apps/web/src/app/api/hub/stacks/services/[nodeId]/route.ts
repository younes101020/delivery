import { z } from "zod";

import { client } from "@/app/_lib/client-http";

interface Params {
  params: Promise<{ nodeId: string }>;
}

export async function DELETE(_: Request, { params }: Params) {
  const { nodeId } = await params;
  const parsed = z.string().uuid().safeParse(nodeId);
  if (!parsed.success)
    return Response.json({ error: "Invalid Forge service ID." }, { status: 422 });

  const http = await client();
  const services = http.hub.stacks as unknown as { services: { ":nodeId": { $delete: (input: { param: { nodeId: string } }) => Promise<Response> } } };
  const response = await services.services[":nodeId"].$delete({ param: { nodeId } });
  return Response.json(await response.json(), { status: response.status });
}
