"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LogsTerminalProps {
  logs: string;
  children: ReactNode;
}

export function LogsTerminal({ logs, children }: LogsTerminalProps) {
  const scroller = (node: HTMLDivElement | null) => {
    node?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-[90vh] bg-black text-primary">
        <DialogHeader>
          <DialogTitle>Build logs</DialogTitle>
        </DialogHeader>
        <pre className="font-mono text-sm w-full overflow-x-auto text-white p-2 rounded-lg">{logs}</pre>
        <div ref={scroller} />
      </DialogContent>
    </Dialog>
  );
}
