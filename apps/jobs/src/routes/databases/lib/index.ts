import { ssh } from "@/lib/ssh";

export async function startDatabase() {
  await ssh(`docker run -l "delivery.resource=database" -d postgres`);
}
