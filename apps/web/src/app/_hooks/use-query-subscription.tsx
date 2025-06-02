"use client";

import { useEffect } from "react";

import { getQueryClient } from "../_lib/react-query-provider";

export function useQuerySubscription<T = Record<string, unknown>>(endpoints: `/${string}`, baseUrl: string, stateCallback?: (data: T, prevData: T) => void) {
  const queryClient = getQueryClient(true);
  useEffect(() => {
    const eventSource = new EventSource(`${baseUrl}/api${endpoints}`);
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
