import { delay, http, HttpResponse } from "msw";

import { DEPLOYMENT_SSE_URL } from "../const";

export const handlers = [http.get(DEPLOYMENT_SSE_URL, async () => {
  const deploymentJSON = [
    {
      jobName: "clone",
      jobId: "job_123abc",
      logs: "Cloning repository from git@github.com:user/repo.git...\nClone completed successfully",
      isCriticalError: false,
    },
    {
      jobName: "build",
      jobId: "job_456def",
      logs: "Installing dependencies...\nRunning npm install\nBuild started...\nBuild completed",
      isCriticalError: false,
    },
    {
      jobName: "configure",
      jobId: "job_789ghi",
      logs: "Configuring environment variables...\nSetting up database connections\nConfiguration complete",
      isCriticalError: false,
    },
    {
      jobName: "build",
      jobId: "job_012jkl",
      logs: "Error: Build failed\nUnable to resolve dependencies",
      isCriticalError: false,
    },
    {
      completed: true,
      appId: 12345,
    },
  ];

  const deploymentStream = new ReadableStream({
    async start(controller) {
      for (const chunk of deploymentJSON) {
        await delay(1000);
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.close();
    },
  });

  return new HttpResponse(deploymentStream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
})];
