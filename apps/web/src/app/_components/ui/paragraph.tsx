import { Ban } from "lucide-react";

import { cn } from "@/app/_lib/utils";

interface ParagraphProps {
  children: string;
  variant: "success" | "error";
}

export function Paragraph({ children, variant }: ParagraphProps) {
  const variantClasses = variant === "error"
    ? "text-destructive bg-destructive/15 border-destructive"
    : "text-success bg-success/15 border-success";

  return (
    <p className={cn("p-2 text-xs border inline-flex gap-2 items-center", variantClasses)}>
      <Ban size={12} />
      <span>/</span>
      {children}
    </p>
  );
}
