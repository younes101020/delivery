import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import OnboardingPage from "../src/app/(onboarding)/page";

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
  test("display signup form on first step", () => {
    render(<OnboardingPage />);
    const form = within(screen.getByRole("form"));
    expect(form.getByRole("textbox", { name: "email" })).toBeDefined();
    expect(form.getByLabelText("password")).toBeDefined();
    expect(form.getByRole("button")).toBeDefined();
  });
});
