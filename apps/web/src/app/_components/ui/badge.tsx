import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/app/_lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "text-destructive-foreground bg-destructive border-transparent shadow-sm",
        outline: "text-foreground",
        active: "text-secondary bg-green-500 border-transparent shadow-sm",
        failed: "text-destructive-foreground bg-destructive border-transparent shadow-sm",
        success: "text-secondary bg-green-500 border-transparent shadow-sm",
        processing: "text-primary-foreground bg-primary border-transparent shadow-sm",
        start: "bg-green-500 text-secondary border-transparent shadow-sm",
        remove: "text-destructive-foreground bg-destructive border-transparent shadow-sm",
        stop: "text-secondary bg-yellow-500 border-transparent shadow-sm",
        create: "text-secondary-foreground bg-secondary border-transparent shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
