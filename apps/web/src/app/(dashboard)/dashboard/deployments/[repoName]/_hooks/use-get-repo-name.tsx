"use client";

import { usePathname } from "next/navigation";

export function useGetRepoName() {
  const path = usePathname();
  return path.split("/").filter(Boolean).slice(2)[0];
}
