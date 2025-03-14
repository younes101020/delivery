"use client";

import { useEffect, useState } from "react";

import { formatDate } from "@/app/_lib/utils";

interface DatabaseDateProps {
  date: number;
}

export function DatabaseDate({ date }: DatabaseDateProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <dd>{isClient && formatDate(date)}</dd>;
}
