import { Deployment } from "@/app/(onboarding)/onboarding/_components/deployment";
import { GithubAppForm } from "@/app/(onboarding)/onboarding/_components/github-app-form";
import { Login } from "@/app/_components/login-form";
import { publicEnv } from "@/env";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, vi } from "vitest";
import { onBoardingTest } from "./fixtures";

function setup(jsx: React.ReactElement) {
  return {
    userAction: userEvent.setup(),
    ...render(jsx),
  };
}

const mockReplace = vi.fn();

describe("Onboarding process", () => {
  beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

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

  onBoardingTest(
    "display error message when trying to register a user who has already registered",
    async ({ users }) => {
      const { userAction } = setup(<Login />);
      const registeredUser = users.find((user) => user.registered);
      const form = within(screen.getByRole("form"));
      await userAction.type(form.getByRole("textbox", { name: "email" }), registeredUser!.email);
      await userAction.type(form.getByLabelText("password"), registeredUser!.password),
        await userAction.click(form.getByRole("button"));
      await waitFor(() => {
        expect(form.getByText("Impossible to sign up")).toBeDefined();
      });
    },
  );

  onBoardingTest("github form include initial object to create a github app from manifest", () => {
    setup(<GithubAppForm baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />);
    const form = within(screen.getByRole("form"));
    const manifestInput = form.getByLabelText<HTMLInputElement>("manifest");
    expect(manifestInput.value).toBeDefined();
    const initialGithubAppManifest = JSON.parse(manifestInput.value);
    expect(initialGithubAppManifest).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        url: expect.any(String),
        hook_attributes: expect.objectContaining({
          url: expect.any(String),
          active: expect.any(Boolean),
        }),
        redirect_url: expect.any(String),
        callback_urls: expect.any(Array),
        setup_url: expect.any(String),
        request_oauth_on_install: expect.any(Boolean),
        default_permissions: expect.objectContaining({
          contents: expect.any(String),
          metadata: expect.any(String),
          emails: expect.any(String),
          administration: expect.any(String),
          pull_requests: expect.any(String),
        }),
        default_events: expect.any(Array),
      }),
    );
  });

  onBoardingTest(
    "submit input should be disabled when no repository is selected",
    ({ installations }) => {
      setup(<Deployment installations={installations} />);
      const form = within(screen.getByRole("form"));
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", true);
    },
  );

  onBoardingTest(
    "submit input should be enabled when repository is selected",
    async ({ installations }) => {
      const { userAction } = setup(<Deployment installations={installations} />);
      const form = within(screen.getByRole("form"));
      const repoCard = screen.getByTestId("1-repo-card");
      await userAction.click(repoCard);
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", false);
    },
  );
});
