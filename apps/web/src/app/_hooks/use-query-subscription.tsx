"use client";

import { useEffect } from "react";

import { getQueryClient } from "@/app/_lib/react-query-provider";
import { env } from "@/env";

export function useQuerySubscription<T = {}>(endpoints: `/${string}`, stateCallback?: (data: T, prevData: T) => void) {
  const queryClient = getQueryClient();
  useEffect(() => {
    const eventSource = new EventSource(`${env.NEXT_PUBLIC_BASEURL}/api${endpoints}`);
    eventSource.onmessage = (event) => {
      const queryData = JSON.parse(event.data);
      const queryKey = queryData.serviceId ? [queryData.serviceId] : queryData.repoName ? [queryData.repoName] : queryData.queryKey ? [queryData.queryKey] : ["deployment"];

      const data = stateCallback ? stateCallback(queryData, queryClient.getQueryData(queryKey)!) : queryData;

      queryClient.setQueriesData({ queryKey }, data);
    };
    return () => {
      eventSource.close();
    };
  }, [queryClient, endpoints]);
}
