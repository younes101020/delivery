import { fetchDockerHubImages } from "../../(dashboard)/dashboard/forge/_lib/docker-hub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();
  const category = url.searchParams.get("category") ?? undefined;
  const page = url.searchParams.get("page") ?? "1";
  const pageSize = url.searchParams.get("page_size") ?? "25";

  const response = await fetchDockerHubImages({ category, page, pageSize, query });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
