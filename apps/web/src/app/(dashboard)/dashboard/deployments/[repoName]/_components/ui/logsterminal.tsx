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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Build logs</DialogTitle>
        </DialogHeader>
        <p>{logs}</p>
      </DialogContent>
    </Dialog>
  );
}
