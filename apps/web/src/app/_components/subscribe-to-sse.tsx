"use client";

import type { ReactNode } from "react";

import { useQuerySubscription } from "@/app/_hooks/use-query-subscription";

interface SubscribeToSSEProps {
  children: ReactNode;
  baseUrl: string;
}

export function SubscribeToSSE({ children, baseUrl }: SubscribeToSSEProps) {
  useQuerySubscription("/deployments-proxy/count", baseUrl);
  return <>{children}</>;
}
