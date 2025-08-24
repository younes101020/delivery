import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";

import { cn } from "@/app/_lib/utils";

const bounceVariants = cva("bg-primary", {
  variants: {
    variant: {
      default: "bg-secondary/50",
      active: "bg-primary",
      failed: "bg-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BounceProps extends VariantProps<typeof bounceVariants> {
  className?: string;
  isActive?: boolean;
}

export function Bounce({ variant, className, isActive }: BounceProps) {
  const bgColor = bounceVariants({ variant });

  return (
    <span className={cn("relative flex size-2 pt-[.25rem]", className)}>
      <span className={cn(
        "absolute inline-flex h-full w-full rounded-full opacity-75",
        isActive && "animate-ping",
        bgColor,
      )}
      >
      </span>
      <span className={cn("relative inline-flex rounded-full h-2 w-2", bgColor)}></span>
    </span>
  );
}
