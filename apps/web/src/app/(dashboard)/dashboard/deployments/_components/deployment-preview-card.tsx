import Link from "next/link";

import { Bounce } from "@/app/_components/bounce";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

interface DeploymentPreviewCardProps {
  id: string;
  step: string;
  timestamp: string;
  repoName: string;
  status: "completed" | "failed" | "active" | "delayed" | "prioritized" | "waiting" | "waiting-children" | "unknown";
  stacktrace: (string | null)[];
}

export function DeploymentPreviewCard({
  step,
  timestamp,
  repoName,
  status,
}: DeploymentPreviewCardProps) {
  const date = formatDate(timestamp);
  return (
    <div
      className="flex flex-col border py-10 relative group/feature"
    >
      <div className={`opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t ${status === "failed" ? "from-red-500/25" : "from-green-500/25"} to-transparent pointer-events-none`} />

      <div className="mb-4 relative z-10 px-10">
        <dl className="text-xs">
          <dt className="text-muted-foreground">Current step</dt>
          <dd className="flex gap-2">
            <Bounce variant={status === "failed" ? "failed" : "active"} />
            {step}
          </dd>
        </dl>
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className={`absolute left-0 inset-y-0 h-6 ${status === "failed" ? "bg-red-500/50" : "bg-green-500/50"} group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full ${status === "failed" ? "group-hover/feature:bg-red-500" : "group-hover/feature:bg-green-500"} transition-all duration-200 origin-center`} />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
          {repoName}
        </span>
      </div>
      <div className="text-xs max-w-xs relative z-10 px-10">
        <dl>
          <dt className="text-muted-foreground">Current step started at</dt>
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
