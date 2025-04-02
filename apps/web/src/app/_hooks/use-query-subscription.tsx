"use client";

import { useEffect } from "react";

import { getQueryClient } from "@/app/_lib/react-query-provider";
import { env } from "@/env";

export function useQuerySubscription(endpoints: `/${string}`) {
  const queryClient = getQueryClient();
  useEffect(() => {
    const eventSource = new EventSource(`${env.NEXT_PUBLIC_BASEURL}/api${endpoints}`);
    eventSource.onmessage = (event) => {
      const queryData = JSON.parse(event.data);
      const queryKey = queryData.serviceId ? [queryData.serviceId] : ["sse"];
      queryClient.setQueriesData({ queryKey }, queryData);
    };
    return () => {
      eventSource.close();
    };
  }, [queryClient, endpoints]);
}
