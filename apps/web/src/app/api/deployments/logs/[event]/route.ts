import { serverEnv } from "@/env";

export async function GET(_: Request, { params }: { params: Promise<{ event: string }> }) {
  const queueName = (await params).event;
  const { body } = await fetch(`${serverEnv.JOBS_API_BASEURL}/deployments/logs/${queueName}`);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
