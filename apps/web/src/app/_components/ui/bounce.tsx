import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";

import { cn } from "@/app/_lib/utils";

const bounceVariants = cva("bg-primary", {
  variants: {
    variant: {
      primary: "bg-primary",
      active: "bg-green-500",
      failed: "bg-red-500",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

interface BounceProps extends VariantProps<typeof bounceVariants> {
  className?: string;
}

export function Bounce({ variant, className }: BounceProps) {
  const bgColor = bounceVariants({ variant });
  const isActive = variant === "active";

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
