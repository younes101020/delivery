import { cn } from "@/app/_lib/utils";
import { roboto } from "@/app/font";

export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn(
      roboto.className,
      "bg-primary text-primary-foreground tracking-wide leading-none italic text-3xl font-bold px-2 py-1 w-fit",
      className,
    )}
    >
      {children}
    </h1>
  );
}
