import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const hubResponse = (results: unknown[]) => new Response(JSON.stringify({ results, next: "https://hub.docker.com/v2/repositories/library/?page=2" }));
const image = { repo_name: "nginx" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("get api hub proxy", () => {
  it("returns only images whose latest registry manifest resolves", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(hubResponse([image, { name: "scratch", namespace: "library", repository_type: null, content_types: [] }]))
      .mockResolvedValueOnce(new Response(null, { status: 401, headers: { "www-authenticate": "Bearer realm=\"https://auth.docker.io/token\",service=\"registry.docker.io\"" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: "registry-token" })))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const response = await GET(new Request("http://localhost/api/hub-proxy?page=1"));

    expect(await response.json()).toEqual({ results: [image], next: "https://hub.docker.com/v2/repositories/library/?page=2" });
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(fetch).toHaveBeenLastCalledWith(
      "https://registry-1.docker.io/v2/library/nginx/manifests/latest",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer registry-token" }), method: "HEAD" }),
    );
  });

  it("omits images without a latest manifest", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(hubResponse([image]))
      .mockResolvedValueOnce(new Response(null, { status: 401, headers: { "www-authenticate": "Bearer realm=\"https://auth.docker.io/token\"" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: "registry-token" })))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetch);

    const response = await GET(new Request("http://localhost/api/hub-proxy?page=1"));

    expect(await response.json()).toEqual({ results: [], next: "https://hub.docker.com/v2/repositories/library/?page=2" });
  });

  it("omits images when registry authentication cannot be completed", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(hubResponse([image]))
      .mockResolvedValueOnce(new Response(null, { status: 401, headers: { "www-authenticate": "Bearer realm=\"https://auth.docker.io/token\"" } }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));
    vi.stubGlobal("fetch", fetch);

    const response = await GET(new Request("http://localhost/api/hub-proxy?page=1"));

    expect(await response.json()).toEqual({ results: [], next: "https://hub.docker.com/v2/repositories/library/?page=2" });
  });

  it("searches Docker Hub for database images when the category is selected", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(hubResponse([image]))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const response = await GET(new Request("http://localhost/api/hub-proxy?category=databases&page=1"));

    expect(await response.json()).toEqual({ results: [image], next: "https://hub.docker.com/v2/repositories/library/?page=2" });
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "https://hub.docker.com/v2/search/repositories?query=database&page=1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
