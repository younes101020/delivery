import { env } from "@/env";

export async function GET() {
  const { body } = await fetch(`${env.JOBS_API_BASEURL}/databases/ongoing`);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
