interface GithubAppOwner {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  avatar_url: string;
  gravatar_id: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface GithubAppPermissions {
  metadata: string;
  contents: string;
  issues: string;
  single_file: string;
}

export interface GithubAppResponse {
  id: number;
  slug: string;
  node_id: string;
  owner: GithubAppOwner;
  name: string;
  description: string;
  external_url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  permissions: GithubAppPermissions;
  events: string[];
  client_id: string;
  client_secret: string;
  webhook_secret: string;
  pem: string;
}
