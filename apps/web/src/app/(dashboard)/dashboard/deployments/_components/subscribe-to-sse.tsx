"use client";

import type { ReactNode } from "react";

import { useQuerySubscription } from "@/app/_hooks/use-query-subscription";

import type { DeploymentPreviewState } from "../types";

interface SubscribeToSSEProps {
  children: ReactNode;
  repoName: string;
  baseUrl: string;
}

export function SubscribeToSSE({ children, repoName, baseUrl }: SubscribeToSSEProps) {
  useQuerySubscription<DeploymentPreviewState>(`/deployments-proxy/preview/${repoName}`, baseUrl);
  return <>{children}</>;
}
