"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { env } from "@/env";

export function useQuerySubscription(endpoints: string) {
  const { data, error } = useQuery({ queryKey: [`sse`] });
  const queryClient = useQueryClient();
  useEffect(() => {
    const eventSource = new EventSource(`${env.NEXT_PUBLIC_BASEURL}/api${endpoints}`);
    eventSource.onmessage = (event) => {
      const queryData = JSON.parse(event.data);
      queryClient.setQueriesData({ queryKey: [`sse`] }, queryData);
    };
    return () => {
      eventSource.close();
    };
  }, [queryClient, endpoints]);

  return {
    data,
    error,
  };
}
