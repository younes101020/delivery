import Link from "next/link";

import { Bounce } from "@/app/_components/bounce";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

interface DeploymentPreviewCardProps {
  id: string;
  previousStep?: string;
  step: string;
  nextStep?: string;
  timestamp: string;
  repoName: string;
  status: "completed" | "failed" | "active" | "delayed" | "prioritized" | "waiting" | "waiting-children" | "unknown";
  stacktrace: (string | null)[];
}

export function DeploymentPreviewCard({
  step,
  timestamp,
  repoName,
  previousStep,
  nextStep,
  status,
}: DeploymentPreviewCardProps) {
  const date = formatDate(timestamp);
  return (
    <div
      className="flex flex-col border py-10 relative group/feature"
    >
      <div className={`opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t ${status === "failed" ? "from-red-500/25" : "from-green-500/25"} to-transparent pointer-events-none`} />

      {status === "active" && (
        <div className="mb-4 relative z-10 px-10">
          <dl className="text-xs">
            <dd className="flex gap-2 line-through opacity-50">
              {previousStep}
            </dd>
          </dl>
          <dl className="text-sm flex gap-2">
            <dt className="pt-[.1rem]">
              <Bounce variant="active" />
            </dt>
            <dd className="flex gap-2 align-middle">
              {step}
            </dd>
          </dl>
          <dl className="text-xs">
            <dd className="flex gap-2 opacity-50">
              {nextStep}
            </dd>
          </dl>
        </div>
      )}

      <div className="text-lg font-bold mb-2 relative z-10 px-10 flex flex-col">
        <div className={`absolute left-0 inset-y-0 h-6 ${status === "failed" ? "bg-red-500/50" : "bg-green-500/50"} group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full ${status === "failed" ? "group-hover/feature:bg-red-500" : "group-hover/feature:bg-green-500"} transition-all duration-200 origin-center`} />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
          {repoName}
        </span>
        <Badge variant={status === "failed" ? "destructive" : "success"} className="w-fit">
          {status}
        </Badge>
      </div>
      <div className="text-xs max-w-xs relative z-10 px-10">
        <dl>
          <dt className="text-muted-foreground">This step started at</dt>
          <dd>
            {date}
          </dd>
        </dl>
        <Link href={`/dashboard/deployments/${repoName}`} className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          View details
          {" "}
          {">"}
        </Link>
      </div>
    </div>
  );
}
