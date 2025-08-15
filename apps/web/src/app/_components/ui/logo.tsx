import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 100 }: LogoProps) {
  return (
    <div className={className}>
      <Image src="/logo.svg" width={size} height={size} alt="Delivery logo" className="h-full" />
    </div>
  );
}
