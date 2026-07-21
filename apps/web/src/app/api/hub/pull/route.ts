import { z } from "zod";

import { client } from "@/app/_lib/client-http";

const pullImageSchema = z.object({
  image: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsedBody = pullImageSchema.safeParse(body);

  if (!parsedBody.success)
    return Response.json({ error: parsedBody.error.flatten() }, { status: 422 });

  const http = await client();
  const response = await http.hub.pull.$post({
    json: parsedBody.data,
  });
  const payload = await response.json();

  return Response.json(payload, { status: response.status });
}
