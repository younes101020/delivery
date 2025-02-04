import { vi } from "vitest";

const mockReplace = vi.fn();

export function mockImports() {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
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

  vi.mock("@/app/actions", () => {
    const signUp = vi.fn();
    signUp.mockResolvedValue({ error: "Impossible to sign up", inputs: { email: "", password: "" } });
    return { signUp };
  });

  globalThis.fetch = vi.fn();
}
