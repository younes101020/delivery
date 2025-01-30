import { vi } from "vitest";

export function mockImports() {
  vi.mock("@/lib/utils", async () => {
    return {
      decryptSecret: vi.fn().mockResolvedValue("mocked-decrypted-secret"),
    };
  });

  vi.mock("@octokit/auth-app", async () => {
    return {
      createAppAuth: vi.fn().mockReturnValue(() => ({
        type: "installation",
        installationId: 123,
        token: "mocked-token",
      })),
    };
  });

  vi.mock("@/lib/ssh", async () => {
    return {
      ssh: vi.fn().mockResolvedValue({
        execCommand: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
      }),
    };
  });
}
