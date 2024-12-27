"use client";

import { Nullable } from "@/lib/utils";
import { useEffect, useState } from "react";
import BoxReveal from "./ui/box-reveal";
import Ripple from "./ui/ripple";

interface StepperProps {
  baseUrl: string;
  queueName: string;
}

const DEPLOYMENTMETADATA = {
  clone: {
    phrase: "We clone your GitHub repo to your server",
    position: "1 / 2",
  },
  build: {
    phrase: "We deploy your application",
    position: "2 / 2",
  },
};

type EventData = Nullable<{
  step: "clone" | "build";
  logs: string;
}>;

export function Stepper({ queueName, baseUrl }: StepperProps) {
  const [eventData, setEventData] = useState<EventData>({
    step: null,
    logs: null,
  });
  useEffect(() => {
    const url = `${baseUrl}/api/deployments/logs/${queueName}`;
    const eventSource = new EventSource(url);

    const handleLogs = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setEventData({
        step: data.jobName,
        logs: data.logs,
      });
    };

    eventSource.addEventListener("image-build-logs", handleLogs);

    return () => {
      eventSource.removeEventListener("image-build-logs", handleLogs);
      eventSource.close();
    };
  }, [baseUrl, queueName]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <BoxReveal duration={0.5}>
        <p className="text-xl font-semibold">
          {eventData.step && DEPLOYMENTMETADATA[eventData.step].phrase}
          <span className="text-primary">.</span>
        </p>
      </BoxReveal>
      <p className="text-xs text-primary">
        {eventData.step && DEPLOYMENTMETADATA[eventData.step].position}
      </p>
      <Ripple />
    </div>
  );
}
