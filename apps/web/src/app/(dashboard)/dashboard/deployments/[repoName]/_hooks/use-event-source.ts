"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SSEMessage<T> {
  jobName: T extends { step: infer S } ? S : never;
  logs: string;
  completed?: boolean;
  isCriticalError?: boolean;
  appId?: string;
  jobId?: string;
}

interface SseProps<T> {
  type: string;
  eventUrl: string;
  initialState: T;
  onMessage?: (prev: T, data: SSEMessage<T>) => T;
}

export function useEventSource<T>({ initialState, eventUrl, type, onMessage }: SseProps<T>) {
  const [sseData, setSseData] = useState<T>(() => initialState);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleMessage = useCallback((prev: T, data: SSEMessage<T>) => {
    if (onMessage) {
      return onMessage(prev, data);
    }
    return prev;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const newEventSource = new EventSource(eventUrl);
    eventSourceRef.current = newEventSource;

    const handleLogs = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setSseData(prev => handleMessage(prev, data));
      }
      catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    newEventSource.addEventListener(type, handleLogs);
    newEventSource.addEventListener("error", () => {
      newEventSource.close();
    });

    return () => {
      newEventSource.removeEventListener(type, handleLogs);
      newEventSource.close();
      eventSourceRef.current = null;
    };
  }, [eventUrl, type, handleMessage]);

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
