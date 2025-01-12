import { cn } from "@/lib/utils";

interface WithBannerBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  badgeText: string;
  badgeColor?: string;
}

export function WithBannerBadge({
  badgeText,
  badgeColor = "bg-primary",
  className,
  children,
  ...props
}: WithBannerBadgeProps) {
  return (
    <div
      className={cn("relative overflow-hidden shadow-sm", className)}
      {...props}
    >
      {children}
      <div
        className={cn(
          "absolute -right-12 top-6 rotate-45 transform px-12 py-1 text-center text-xs text-primary-foreground font-thin",
          badgeColor,
        )}
      >
        {badgeText}
      </div>
    </div>
  );
}
