"use client";

import { useEffect, useState } from "react";

import { useResourcesDictionary } from "@/app/_ctx/resources-dictionary";
import { toLocalDateString } from "@/app/_lib/utils";

interface AppDateProps {
  date: string;
}

export function AppDate({ date }: AppDateProps) {
  const { locale } = useResourcesDictionary();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <dd>{isClient && toLocalDateString(date, locale)}</dd>;
}
