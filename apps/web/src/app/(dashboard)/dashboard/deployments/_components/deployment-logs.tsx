"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";

interface DeploymentLogsProps {
  logs?: string;
  children?: React.ReactNode;
}

export function DeploymentLogsCard({ logs, children }: DeploymentLogsProps) {
  "use no memo"; // needed to ensure scrolls are updated on new logs
  const scroller = (node: HTMLDivElement | null) => {
    node?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card>
      <ScrollArea className="h-[20rem] w-[50rem] bg-black ">
        <CardContent className="relative">
          <pre className="font-mono text-sm w-full text-white p-2 rounded-lg">
            {logs}
          </pre>
          {!children && <span className="text-primary font-thin absolute bottom-[1.9rem] left-3">{">"}</span>}
          {children}
          <div ref={scroller} />
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
