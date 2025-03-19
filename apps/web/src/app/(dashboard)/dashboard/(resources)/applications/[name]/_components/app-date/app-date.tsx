"use client";

import { useEffect, useState } from "react";

import { formatDate } from "@/app/_lib/utils";

interface AppDateProps {
  date: string;
}

export function AppDate({ date }: AppDateProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <dd>{isClient && formatDate(date)}</dd>;
}
