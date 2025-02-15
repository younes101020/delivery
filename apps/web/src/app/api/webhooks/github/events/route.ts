import { basename } from "node:path";

import { client } from "@/app/_lib/client-http";
import { getApplications } from "@/app/(dashboard)/dashboard/applications/_lib/queries";

export async function POST(req: Request) {
  const { repository } = await req.json();
  const queueName = basename(repository.url).toLowerCase();
  const applications = await getApplications();
  if (!applications) {
    return Response.json({ message: "No applications found" }, { status: 404 });
  }
  const isApplicationRegistered = applications.some(app => app.name === queueName);
  if (isApplicationRegistered) {
    await client.deployments.redeploy[":queueName"].$post({
      param: {
        queueName,
      },
    });
    return Response.json({ message: "Application redeploy" });
  }
  return Response.json({ message: "Application not found" }, { status: 404 });
}
