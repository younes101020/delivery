import { http } from "msw";

import { env } from "@/env";

import { getTeamResolver } from "./resolvers";

const TEAM_URL = new URL("/users/:userId/team", env.JOBS_API_BASEURL).toString();

export default [
  http.get(TEAM_URL, getTeamResolver),
];
