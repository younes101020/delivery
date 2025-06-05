import { getUser } from "@/app/_lib/user-session";

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
