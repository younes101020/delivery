"use client";

import { useEffect, useState } from "react";

import { toLocalDateString } from "@/app/_lib/utils";

interface DatabaseDateProps {
  date: string;
}

export function DatabaseDate({ date }: DatabaseDateProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <dd>{isClient && toLocalDateString(date)}</dd>;
}
