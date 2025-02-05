import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, describe, vi } from "vitest";

/* function setup(jsx: React.ReactElement) {
  return {
    userAction: userEvent.setup(),
    ...render(jsx),
  };
} */

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

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  /* deploymentTest(
    "submit input should be disabled when no repository is selected",
    ({ githubRepositories }) => {
      setup(<DeploymentForm installations={githubRepositories} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", true);
    },
  );

  deploymentTest(
    "submit input should be enabled when repository is selected",
    async ({ githubRepositories }) => {
      const { userAction } = setup(<DeploymentForm installations={githubRepositories} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      const repoCard = screen.getByTestId("1-repo-card");
      await userAction.click(repoCard);
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", false);
    },
  ); */
});
