import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, vi } from "vitest";

import { Login } from "@/app/_components/login-form";

import { GithubAppForm } from "../_components/github-app-form";
import { onBoardingTest } from "./fixtures";
import { setup } from "./utils";

describe("onboarding process", () => {
  beforeAll(() => {
    vi.mock("@/app/actions", () => {
      const signUp = vi.fn();
      signUp.mockResolvedValue({ error: "Impossible to sign up", inputs: { email: "", password: "" } });
      return { signUp };
    });

    vi.mock("@/app/(login)/actions", () => {
      const signIn = vi.fn();
      signIn.mockResolvedValue({ error: "Impossible to sign in", inputs: { email: "", password: "" } });
      return { signIn };
    });

    globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  onBoardingTest(
    "should display error message related to registering",
    async ({ users }) => {
      const { userAction } = setup(<Login />);
      const registeredUser = users.find(user => user.registered);
      const form = within(screen.getByRole("form"));

      await userAction.type(form.getByRole("textbox", { name: "email" }), registeredUser!.email);
      await userAction.type(form.getByLabelText("password"), registeredUser!.password);
      await userAction.click(form.getByRole("button"));

      await waitFor(() => {
        expect(form.getByText("Impossible to sign up")).toBeDefined();
      });
    },
  );

  onBoardingTest("github form include initial object to create a github app from manifest", () => {
    setup(<GithubAppForm isOnboarding={true} />);

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

  /* onBoardingTest(
    "submit input should be disabled when no repository is selected",
    ({ installations }) => {
      setup(<DeploymentForm installations={installations} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", true);
    },
  );

  onBoardingTest(
    "submit input should be enabled when repository is selected",
    async ({ installations }) => {
      const { userAction } = setup(<Deployment installations={installations} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      const repoCard = screen.getByTestId("1-repo-card");
      await userAction.click(repoCard);
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", false);
    },
  ); */
});
