"use client";

import { useEffect, useState } from "react";

import { useResourcesDictionary } from "@/app/_ctx/resources-dictionary";
import { toLocalDateString } from "@/app/_lib/utils";

interface DatabaseDateProps {
  date: string;
}

export function DatabaseDate({ date }: DatabaseDateProps) {
  const { locale } = useResourcesDictionary();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <dd>{isClient && toLocalDateString(date, locale)}</dd>;
}
