"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SseProps<T> {
  eventUrl: string;
  initialState: T;
  onMessage?: (prev: T, data: T) => void;
}

export function useEventSource<T extends { logs?: string | null }>({ initialState, eventUrl, onMessage }: SseProps<T>) {
  const [sseData, setSseData] = useState<T>(() => initialState);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleMessage = useCallback((prev: T, data: T) => {
    if (onMessage) {
      onMessage(prev, data);
    }
    return data.logs ? { ...data, logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs } : data;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const newEventSource = new EventSource(eventUrl);
    eventSourceRef.current = newEventSource;

    newEventSource.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as T;
        setSseData(prev => handleMessage(prev, data));
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
  }, [eventUrl]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup();
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  return { ...sseData, reconnect };
}
