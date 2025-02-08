import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, vi } from "vitest";

import { DeploymentForm } from "../_components/deployment-form";
import { deploymentTest } from "./fixtures";

function setup(jsx: React.ReactElement) {
  return {
    userAction: userEvent.setup(),
    ...render(jsx),
  };
}

const mockReplace = vi.fn();

describe("onboarding process", () => {
  beforeAll(() => {
    vi.mock("next/navigation", async () => {
      const actual = await vi.importActual("next/navigation");
      return {
        ...actual,
        useRouter: vi.fn(() => ({
          push: vi.fn(),
          replace: mockReplace,
        })),
        useSearchParams: vi.fn(() => ({
          get: vi.fn(),
        })),
        usePathname: vi.fn().mockReturnValue("/onboarding"),
        useUser: vi.fn(),
      };
    });
  });

  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  deploymentTest(
    "submit input should be disabled when no repository is selected",
    ({ repositories, githubApps }) => {
      setup(<DeploymentForm repositories={repositories} githubApps={githubApps} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", true);
    },
  );

  deploymentTest(
    "submit input should be enabled when repository is selected",
    async ({ repositories, githubApps }) => {
      const { userAction } = setup(<DeploymentForm repositories={repositories} githubApps={githubApps} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      const repoCard = screen.getByTestId("1-repo-card");
      await userAction.click(repoCard);
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", false);
    },
  );
});
