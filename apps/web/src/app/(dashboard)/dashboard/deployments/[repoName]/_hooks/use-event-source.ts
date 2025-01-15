"use client";

import { useEffect, useState } from "react";

export type SSEMessage<T> = {
  jobName: T extends { step: infer S } ? S : never;
  logs: string;
  completed?: boolean;
  id?: string;
};

type SseProps<T> = {
  type: string;
  eventUrl: string;
  initialState: T;
  onMessage?: (prev: T, data: SSEMessage<T>) => T;
};

export function useEventSource<T>({ initialState, eventUrl, type, onMessage }: SseProps<T>): T {
  const [sseData, setSseData] = useState<T>(() => initialState);

  useEffect(() => {
    let mounted = true;
    const handleLogs = (e: MessageEvent) => {
      if (!mounted) return;

      try {
        const data = JSON.parse(e.data);
        if (onMessage) {
          setSseData((prev) => onMessage(prev, data));
        }
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    const eventSource = new EventSource(eventUrl);
    eventSource.addEventListener(type, handleLogs);
    eventSource.addEventListener("error", (e) => {
      if (mounted) {
        eventSource.close();
      }
    });

    return () => {
      mounted = false;
      eventSource.removeEventListener(type, handleLogs);
      eventSource.close();
    };
  }, [eventUrl, type]);

  return sseData;
}
