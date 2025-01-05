"use client";

import { useState } from "react";

import { useEffect } from "react";

type SSEMessage<T> = {
  jobName: T extends { step: infer S } ? S : never;
  logs: string;
  completed?: boolean;
};

type SseProps<T> = {
  type: string;
  eventUrl: string;
  initialState: T;
  onMessage?: (prev: T, data: SSEMessage<T>) => T;
};

export function useEventSource<T>({ initialState, eventUrl, type, onMessage }: SseProps<T>): T {
  const [sseData, setSseData] = useState(initialState);

  useEffect(() => {
    const eventSource = new EventSource(eventUrl);

    const handleLogs = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (onMessage) {
        setSseData((prev) => {
          const state = onMessage(prev, data);
          return state;
        });
      }
    };

    eventSource.addEventListener(type, handleLogs);

    return () => {
      eventSource.removeEventListener(type, handleLogs);
      eventSource.close();
    };
  }, [eventUrl, onMessage]);

  return sseData;
}
