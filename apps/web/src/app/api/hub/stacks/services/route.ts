import { z } from "zod";

import { client } from "@/app/_lib/client-http";

const requestSchema = z.object({
  project: z.object({ id: z.string().uuid(), name: z.string().trim().min(1) }),
  projectLayout: z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive() }),
  service: z.object({
    nodeId: z.string().uuid(),
    image: z.string().trim().min(1),
    ports: z.string(),
    environmentVariables: z.string(),
    startCommand: z.string(),
    layout: z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive() }),
  }),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });

  const http = await client();
  const services = http.hub.stacks as unknown as { services: { $post: (input: { json: z.infer<typeof requestSchema> }) => Promise<Response> } };
  const response = await services.services.$post({ json: parsed.data });
  return Response.json(await response.json(), { status: response.status });
}
