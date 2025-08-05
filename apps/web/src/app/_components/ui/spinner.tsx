import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";

import { cn } from "@/app/_lib/utils";

const spinnerVariants = cva("border border-dashed size-2", {
  variants: {
    variant: {
      primary: "border-primary bg-transparent",
      secondary: "border-secondary bg-transparent",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function Spinner({ className, variant }: SpinnerProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 180, 180, 0],
        borderRadius: ["0%", "0%", "50%", "50%", "0%"],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1,
      }}
      className={cn(spinnerVariants({ variant }), className)}
    />
  );
}
