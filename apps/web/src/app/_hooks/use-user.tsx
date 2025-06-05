"use client";

import type { NewUser as User } from "@delivery/jobs/types";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useFetch } from "../_lib/fetch-provider";

export function useUser() {
  const { fetcher } = useFetch();
  const user = useSuspenseQuery<User>({
    queryKey: ["user"],
    queryFn: () => fetcher("/api/user"),
  });

  return {
    user: user.data,
  };
}
