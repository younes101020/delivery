"use client";

import { useEffect } from "react";
import BoxReveal from "./ui/box-reveal";
import Ripple from "./ui/ripple";

interface StepperProps {
  baseUrl: string;
  queueName: string;
}

export function Stepper({ queueName, baseUrl }: StepperProps) {
  useEffect(() => {
    const eventSource = new EventSource(`${baseUrl}/api/deployments/logs/${queueName}`);
    eventSource.onmessage = (e) => {
      console.log(e);
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <BoxReveal duration={0.5}>
        <p className="text-xl font-semibold">
          We clone your GitHub repo to your server<span className="text-primary">.</span>
        </p>
      </BoxReveal>
      <p className="text-xs text-primary">1 / 2</p>
      <Ripple />
    </div>
  );
}
