"use client";

import type { ReactNode } from "react";

import { useQuerySubscription } from "@/app/_hooks/use-query-subscription";

interface SubscribeToSSEProps {
  children: ReactNode;
}

export function SubscribeToSSE({ children }: SubscribeToSSEProps) {
  useQuerySubscription("/applications-proxy/ongoing");
  return <>{children}</>;
}
