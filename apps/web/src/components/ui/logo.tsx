import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image src="/logo.svg" width={100} height={100} alt="Delivery logo" className="h-full" />
    </div>
  );
}
