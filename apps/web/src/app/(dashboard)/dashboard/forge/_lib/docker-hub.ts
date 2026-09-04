export const MANIFEST_ACCEPT = [
  "application/vnd.oci.image.index.v1+json",
  "application/vnd.oci.image.manifest.v1+json",
  "application/vnd.docker.distribution.manifest.list.v2+json",
  "application/vnd.docker.distribution.manifest.v2+json",
].join(", ");

export interface DockerHubImage {
  name?: string;
  namespace?: string;
  repo_name?: string;
  repository_type?: string | null;
  content_types?: string[];
  description?: string;
  short_description?: string;
  pull_count?: number | string;
  star_count?: number | string;
  is_official?: boolean;
}

export interface DockerHubResponse {
  results?: DockerHubImage[];
  next?: string | null;
  [key: string]: unknown;
}

function getRepository(image: DockerHubImage) {
  const name = image.repo_name ?? image.name;
  if (!name)
    return null;

  const parts = name.replace(/^docker\.io\//, "").split("/").filter(Boolean);
  if (parts.length === 1)
    return `${image.namespace ?? "library"}/${parts[0]}`;
  if (parts.length === 2)
    return parts.join("/");
  return null;
}

function isImageRepository(image: DockerHubImage) {
  return image.repository_type !== null && (image.content_types === undefined || image.content_types.includes("image"));
}

function getBearerParameters(value: string | null) {
  if (!value?.startsWith("Bearer "))
    return null;

  const realm = value.match(/realm="([^"]+)"/i)?.[1];
  if (!realm)
    return null;

  return { realm, service: value.match(/service="([^"]+)"/i)?.[1] };
}

async function getRegistryToken(challenge: string | null, repository: string) {
  const parameters = getBearerParameters(challenge);
  if (!parameters)
    return null;

  const url = new URL(parameters.realm);
  if (parameters.service)
    url.searchParams.set("service", parameters.service);
  url.searchParams.set("scope", `repository:${repository}:pull`);

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok)
    return null;

  const body: unknown = await response.json().catch(() => null);
  return typeof body === "object" && body !== null && "token" in body && typeof body.token === "string" ? body.token : null;
}

async function canPullLatest(image: DockerHubImage) {
  if (!isImageRepository(image))
    return false;

  const repository = getRepository(image);
  if (!repository)
    return false;

  const manifestUrl = `https://registry-1.docker.io/v2/${repository}/manifests/latest`;
  const headers = { Accept: MANIFEST_ACCEPT };
  const initialResponse = await fetch(manifestUrl, { method: "HEAD", headers }).catch(() => null);
  if (!initialResponse)
    return false;
  if (initialResponse.ok)
    return true;

  const token = await getRegistryToken(initialResponse.headers.get("www-authenticate"), repository).catch(() => null);
  if (!token)
    return false;

  const manifestResponse = await fetch(manifestUrl, {
    method: "HEAD",
    headers: { ...headers, Authorization: `Bearer ${token}` },
  }).catch(() => null);

  return manifestResponse?.ok === true;
}

export async function fetchDockerHubImages({
  category,
  page,
  pageSize,
  query,
}: {
  category?: string;
  page: string;
  pageSize: string;
  query?: string;
}) {
  const categoryQuery = category === "databases" ? "database" : undefined;
  const searchQuery = query?.trim()
    ? categoryQuery ? `${categoryQuery} ${query.trim()}` : query.trim()
    : categoryQuery;
  const targetUrl = searchQuery
    ? `https://hub.docker.com/v2/search/repositories?query=${encodeURIComponent(searchQuery)}&page=${encodeURIComponent(page)}`
    : `https://hub.docker.com/v2/repositories/library/?page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(pageSize)}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const body: DockerHubResponse = await response.json();
  const results = body.results ?? [];
  const pullableResults = await Promise.all(results.map(async image => await canPullLatest(image) ? image : null));

  return {
    ...body,
    results: pullableResults.filter((image): image is DockerHubImage => image !== null),
  } satisfies DockerHubResponse;
}
