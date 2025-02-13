export function Bounce({ variant = "primary" }: { variant?: "primary" | "active" | "failed" }) {
  const bgColor = {
    primary: "bg-primary",
    active: "bg-green-500",
    failed: "bg-red-500",
  }[variant];

  return (
    <span className="relative flex h-2 w-2 pt-[.25rem]">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${bgColor} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-2 w-2 ${bgColor}`}></span>
    </span>
  );
}
