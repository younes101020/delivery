"use client";

import { useResourcesDictionary } from "@/app/_ctx/resources-dictionary";
import { toLocalDateString } from "@/app/_lib/utils";

interface AppDeploymentDateProps {
  deployedAt: string;
}

export default function AppDeploymentDate({ deployedAt }: AppDeploymentDateProps) {
  const { locale } = useResourcesDictionary();
  return <dd className="text-xs">{toLocalDateString(deployedAt, locale)}</dd>;
}
