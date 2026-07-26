import { client } from "@/app/_lib/client-http";

export async function GET() {
  const http = await client();
  const stacks = http.hub.stacks as unknown as { $get: () => Promise<Response> };
  const response = await stacks.$get();
  return Response.json(await response.json(), { status: response.status });
}
