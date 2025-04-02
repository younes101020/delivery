import { env } from "@/env";

export async function GET(_: Request, { params }: { params: Promise<{ event: string }> }) {
  const queueName = (await params).event;
  const { body } = await fetch(`${env.JOBS_API_BASEURL}/deployments/preview/${queueName}`);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
