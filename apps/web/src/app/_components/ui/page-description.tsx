import { ChevronRight } from "lucide-react";

import { robotoLight } from "@/app/font";

export function PageDescription({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center bg-primary text-primary-foreground w-fit py-1 px-2">
      <ChevronRight strokeWidth={0.9} />
      <h2 className={`${robotoLight.className} w-fit tracking-wide leading-none text-lg italic`}>
        {children}
      </h2>
    </div>
  );
}
