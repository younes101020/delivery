"use client";

import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { EmptyState } from "@/app/_components/ui/empty-state";

interface NoDeploymentsProps {
  title: string;
  description: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export function EmptyDeployment({ title, description, Icon }: NoDeploymentsProps) {
  return (
    <div className="h-full flex justify-center items-center md:col-span-2 lg:col-span-3 xl:col-span-4">
      <EmptyState
        title={title}
        description={description}
        icons={[Icon]}
      />
    </div>
  );
}
