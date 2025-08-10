import { getContext } from "hono/context-storage";
import { getCookie } from "hono/cookie";

export function isOnboarding() {
  const c = getContext();
  const skiponboarding = getCookie(c, "skiponboarding");
  return skiponboarding === "false";
}
