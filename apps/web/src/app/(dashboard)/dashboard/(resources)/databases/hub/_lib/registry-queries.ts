import { createAPIMethod } from "@/app/_lib/utils";

interface DockerRegistryImageVersion {
  results: { name: string }[];
}

export async function getVersionsComboboxOptions() {
  const getDatabaseVersion = createAPIMethod<
    { page: string; page_size: string },
    DockerRegistryImageVersion
  >({
    method: "GET",
    url: `https://hub.docker.com/v2/repositories/library/postgres/tags`,
  });
  const dbVersionsResponse = await getDatabaseVersion({ page: "2", page_size: "10" });

  return dbVersionsResponse.results.map(version => ({ value: version.name, label: version.name }));
}
