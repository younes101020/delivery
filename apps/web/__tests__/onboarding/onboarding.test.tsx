import { Deployment } from "@/app/(onboarding)/_components/deployment";
import { GithubAppForm } from "@/app/(onboarding)/_components/github-app-form";
import { Login } from "@/app/(onboarding)/_components/login-form";
import { publicEnv } from "@/env";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, vi } from "vitest";
import { onBoardingTest } from "./fixtures";

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: vi.fn(),
    })),
    usePathname: vi.fn(),
    useUser: vi.fn(),
  };
});

describe("Onboarding page", () => {
  beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
  });

  onBoardingTest("display signup form", () => {
    render(<Login />);
    const form = within(screen.getByRole("form"));
    expect(form.getByRole("textbox", { name: "email" })).toBeDefined();
    expect(form.getByLabelText("password")).toBeDefined();
    expect(form.getByRole("button")).toBeDefined();
  });

  onBoardingTest("include initial object to create a github app from manifest", () => {
    render(<GithubAppForm baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />);
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

  onBoardingTest("disable submit input when no repository selected", ({ repositories }) => {
    render(<Deployment repositories={repositories} />);
    const form = within(screen.getByRole("form"));
    expect(form.getByLabelText("submit")).toHaveProperty("disabled", true);
  });
});
