import { z } from "zod";

import { client } from "@/app/_lib/client-http";

const startStackSchema = z.object({
  project: z.object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
  }),
  services: z.array(z.object({
    nodeId: z.string().trim().min(1),
    image: z.string().trim().min(1),
    ports: z.string(),
    environmentVariables: z.string(),
    startCommand: z.string(),
  })).min(1),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsedBody = startStackSchema.safeParse(body);

  if (!parsedBody.success)
    return Response.json({ error: parsedBody.error.flatten() }, { status: 422 });

  const http = await client();
  const response = await http.hub.stacks.start.$post({
    json: parsedBody.data,
  });
  const payload = await response.json();

  return Response.json(payload, { status: response.status });
}
