import { faker } from "@faker-js/faker";
import { delay, HttpResponse } from "msw";

import type { ApplicationStatusData } from "@/app/(dashboard)/dashboard/(resources)/applications/_components/types";

const applications = faker.helpers.multiple(() => faker.string.uuid(), {
  count: 5,
});
let fetchedApplications: Record<string, any>[] = [];

const encoder = new TextEncoder();

export function getAppListResolver() {
  if (fetchedApplications.length > 0)
    return HttpResponse.json(fetchedApplications);

  fetchedApplications = applications.map(applicationId => ({
    id: applicationId,
    name: faker.company.name(),
    isActive: true,
    createdAt: new Date().toISOString(),
    isProcessing: false,
    image: `${faker.person.firstName().toLowerCase()}:latest`,
  }
  ));

  return HttpResponse.json(fetchedApplications);
}

const appEventResolver = new Proxy<(Omit<ApplicationStatusData, "containerId"> & { serviceId: string })[]>(
  [
    {
      status: "active",
      jobId: applications[0],
      serviceId: applications[0],
      queueName: "remove",
      processName: "remove",
    },
    {
      status: "completed",
      jobId: applications[0],
      serviceId: applications[0],
      queueName: "remove",
      processName: "remove",
    },
  ],
{
  get(target, prop) {
    if (prop === "1") {
      fetchedApplications.shift();
    }
    return target[prop as keyof typeof target];
  },
},
);

export function getAppEventResolver() {
  const appEventStream = new ReadableStream({
    async start(controller) {
      await delay(10000);
      for (const chunk of appEventResolver) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        await delay(5000);
      }
      controller.close();
    },
  });

  return new HttpResponse(appEventStream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
