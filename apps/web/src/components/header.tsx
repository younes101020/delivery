"use client";

import { Logo } from "./ui/logo";

export function Header() {
  return (
    <header className="bg-black/45 border-primary border-b h-[5vh] flex">
      <Logo />
    </header>
  );
}
