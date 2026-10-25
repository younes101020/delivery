import type { Dictionary, Locale } from "@delivery/i18n";

import { render } from "@testing-library/react";

import { ResourcesDictionaryProvider } from "@/app/_ctx/resources-dictionary";
import { env } from "@/env";

import { SubscribeToSSE } from "../_components/subscribe-to-sse";

const DEPLOYMENTS_DICTIONARY = {
  failedTitle: "Unable to deploy your application",
  failedDescription: "Once you have resolved the issue, you can redeploy.",
  redeployment: "Redeploying...",
  retry: "Retry",
} as unknown as Dictionary["deployments"];

interface SetupOptions {
  deployments?: Dictionary["deployments"];
  locale?: Locale;
}

export function setup(jsx: React.ReactElement, { deployments = DEPLOYMENTS_DICTIONARY, locale = "en" }: SetupOptions = {}) {
  const baseUrl = env.WEB_BASE_URL;
  return {
    ...render(jsx, { wrapper: () => (
      <SubscribeToSSE baseUrl={baseUrl}>
        <ResourcesDictionaryProvider
          deployments={deployments}
          locale={locale}
          navigation={{} as Dictionary["navigation"]}
          resources={{} as Dictionary["resources"]}
          settings={{} as Dictionary["settings"]}
        >
          {jsx}
        </ResourcesDictionaryProvider>
      </SubscribeToSSE>
    ) }),
  };
}
