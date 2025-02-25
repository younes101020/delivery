"use client";

import { useEffect, useRef, useState } from "react";

interface SseProps<T> {
  eventUrl: string;
  initialState: T;
  onMessage: (prev: T, data: T) => T;
}

export function useEventSource<T>({ initialState, eventUrl, onMessage }: SseProps<T>) {
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
        setSseData(prev => onMessage(prev, data));
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
  }, [eventUrl, onMessage]);

  return sseData;
}
