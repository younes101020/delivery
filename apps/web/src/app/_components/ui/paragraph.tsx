import { Ban, Check } from "lucide-react";

import { cn } from "@/app/_lib/utils";

interface ParagraphProps {
  children: string;
  variant: "success" | "error";
}

const ParagraphIcon = new Map([
  ["success", <Check size={12} key={0} />],
  ["error", <Ban size={12} key={1} />],
]);

export function Paragraph({ children, variant }: ParagraphProps) {
  const variantClasses = variant === "error"
    ? "text-destructive bg-destructive/15 border-destructive"
    : "text-success bg-success/15 border-success";

  return (
    <p className={cn("p-2 text-xs border inline-flex gap-2 items-center", variantClasses)}>
      {ParagraphIcon.get(variant)}
      <span>|</span>
      {children}
    </p>
  );
}
