export const API_KEY_SCOPES = [
  "applications:read",
  "applications:write",
  "databases:read",
  "databases:write",
  "deployments:read",
  "deployments:write",
  "envvars:write",
  "githubapps:read",
  "githubapps:write",
  "serverconfig:read",
  "serverconfig:write",
  "version:read",
  "version:write",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];
