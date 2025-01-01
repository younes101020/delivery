import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface LogsTerminalProps {
  logs: string;
  children: ReactNode;
}

export function LogsTerminal({ logs, children }: LogsTerminalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Build logs</DialogTitle>
        </DialogHeader>
        <p>{logs}</p>
      </DialogContent>
    </Dialog>
  );
}
