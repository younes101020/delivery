import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventSource } from "eventsource";

import { Deployment } from "../_components/deployment";
import { setup } from "./utils";

describe("deployment", () => {
  it("should display retry button when deployment error is thrown", async () => {
    setup(<Deployment />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Retry/ })).toBeDefined();
    }, {
        timeout: 50000
    });
  }, {timeout: 60000});
});

vi.stubGlobal("EventSource", EventSource);
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", async (importOriginal) => {
  return {
    ...await importOriginal<typeof import("next/navigation")>(),
    usePathname: vi.fn().mockReturnValue("/dashboard/deployments/my-app"),
  }
})
