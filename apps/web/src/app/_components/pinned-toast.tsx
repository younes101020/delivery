import { roboto } from "../font";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";

interface PinnedToastProps extends React.HTMLAttributes<HTMLDivElement> {
  isPending?: boolean;
  icon: React.ReactNode;
  flag?: string;
  children?: React.ReactNode;
}

export function PinnedToast({
  isPending,
  icon,
  flag,
  children,
  ...props
}: PinnedToastProps) {
  return (
    <div
      className={`${roboto.className} p-4 flex items-center gap-4 border mb-2 text-xs bg-accent relative`}
      {...props}
    >
      {flag && (
        <span className="absolute top-0 bg-primary text-primary-foreground px-2 py-1 right-0 rounded-bl-lg rounded-tr-lg italic">
          {flag}
        </span>
      )}
      <div className="flex items-center gap-2">
        {
          isPending
            ? <Spinner variant="primary" className="mr-2" />
            : icon
        }
        <Separator orientation="vertical" className="h-6" />
        {children}
      </div>
    </div>
  );
}
