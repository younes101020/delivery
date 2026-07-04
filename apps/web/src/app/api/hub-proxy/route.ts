export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();
  const page = url.searchParams.get("page") ?? "1";
  const pageSize = url.searchParams.get("page_size") ?? "25";

  const targetUrl = query
    ? `https://hub.docker.com/v2/search/repositories?query=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}`
    : `https://hub.docker.com/v2/repositories/library/?page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(pageSize)}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const body = await response.json();

  return new Response(JSON.stringify(body), {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
