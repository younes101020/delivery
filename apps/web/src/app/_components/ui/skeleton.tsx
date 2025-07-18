import { cn } from "@/app/_lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary", className)}
      {...props}
    />
  );
}

export { Skeleton };
