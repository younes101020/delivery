import { useSuspenseQuery } from "@tanstack/react-query";

import type { TeamForUser } from "../api/team/queries";

import { useFetch } from "../_lib/fetch-provider";

export function useTeam() {
  const { fetcher } = useFetch();
  const user = useSuspenseQuery<TeamForUser>({
    queryKey: ["team"],
    queryFn: () => fetcher("/api/team"),
  });

  return user.data;
}
