"use client";

import { usePathname } from "next/navigation";
import { Logo } from "./ui/logo";

export function Header() {
  const pathname = usePathname();
  if (pathname.includes("dashboard")) return null;
  return (
    <header className="bg-black/45 border-primary border-b h-[5vh] flex">
      <Logo />
    </header>
  );
}
