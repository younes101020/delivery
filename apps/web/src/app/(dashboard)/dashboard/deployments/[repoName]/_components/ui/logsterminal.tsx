"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useRef, useEffect } from "react";

interface LogsTerminalProps {
  logs: string;
  children: ReactNode;
}

export function LogsTerminal({ logs, children }: LogsTerminalProps) {
  const logsEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs]);
  
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-[90vh] bg-black text-primary">
        <DialogHeader>
          <DialogTitle>Build logs</DialogTitle>
        </DialogHeader>
        <pre className="font-mono text-sm w-full overflow-x-auto text-white p-2 rounded-lg">{logs}</pre>
        <div ref={logsEndRef} />
      </DialogContent>
    </Dialog>
  );
}
