import type { Dictionary } from "@delivery/i18n";

import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Deployment } from "../_components/deployment";
import { DeploymentError } from "../_components/deployment-error";
import { setup } from "./utils";

vi.mock("@/app/actions", () => ({ retryDeploy: vi.fn() }));

const FRENCH_DEPLOYMENTS_DICTIONARY = {
  failedTitle: "Impossible de déployer votre application",
  failedDescription: "Une fois le problème résolu, vous pouvez redéployer.",
  redeployment: "Redéploiement...",
  retry: "Réessayer",
} as unknown as Dictionary["deployments"];

afterEach(() => {
  cleanup();
});

describe("deployment", () => {
  it("should display retry button when deployment error is thrown", async () => {
    setup(<Deployment />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Retry/ })).toBeDefined();
    }, { timeout: 5000 });
  });

  it("renders the deployment error panel in French", () => {
    setup(
      <DeploymentError
        data={{
          isCriticalError: true,
          jobId: "job-id",
          jobName: "build",
          logs: "raw job logs",
        }}
      />,
      { deployments: FRENCH_DEPLOYMENTS_DICTIONARY, locale: "fr" },
    );

    expect(screen.getByText("Impossible de déployer votre application")).toBeDefined();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeDefined();
  });
});
