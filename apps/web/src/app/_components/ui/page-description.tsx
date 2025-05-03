import { ChevronRight } from "lucide-react";

import { cn } from "@/app/_lib/utils";
import { robotoLight } from "@/app/font";

export function PageDescription({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className="flex items-center bg-primary text-primary-foreground w-fit py-1 px-2">
      <ChevronRight strokeWidth={0.9} />
      <h2 className={cn(robotoLight.className, "w-fit tracking-wide leading-none text-lg italic", className)}>
        {children}
      </h2>
    </div>
  );
}
