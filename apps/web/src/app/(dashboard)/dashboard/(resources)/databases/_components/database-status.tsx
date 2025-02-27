"use client";

import { Bounce } from "@/app/_components/ui/bounce";

interface DatabaseStatusProps {
  state: string;
}

export function DatabaseStatus({ state }: DatabaseStatusProps) {
  // const { data, error } = useQuery({ queryKey: [`sse`] });
  return (
    <dd className="flex gap-1">
      <Bounce variant={state === "running" ? "active" : state === "exited" ? "failed" : "primary"} />
      {state}
    </dd>
  );
}
