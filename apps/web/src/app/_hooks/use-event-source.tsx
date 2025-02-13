"use client";

import { useEffect, useRef, useState } from "react";

interface SseProps<T> {
  eventUrl: string;
  initialState: T;
  onMessage?: (prev: T, data: T) => void;
  boolDependency?: boolean | null;
}

export function useEventSource<T extends { logs?: string | null }>({ initialState, eventUrl, onMessage, boolDependency }: SseProps<T>) {
  const [sseData, setSseData] = useState<T>(() => initialState);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const newEventSource = new EventSource(eventUrl);
    eventSourceRef.current = newEventSource;

    newEventSource.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as T;
        setSseData((prev) => {
          if (onMessage) {
            onMessage(prev, data);
          }
          return data.logs ? { ...data, logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs } : data;
        });
      }
      catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    newEventSource.onerror = () => {
      newEventSource.close();
    };

    return () => {
      newEventSource.close();
      eventSourceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventUrl, onMessage, ...(boolDependency !== undefined ? [boolDependency] : [])]);

  return sseData;
}
