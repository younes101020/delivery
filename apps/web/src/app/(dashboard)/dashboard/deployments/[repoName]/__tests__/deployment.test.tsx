import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Deployment } from "../_components/deployment";
import { setup } from "./utils";

describe("deployment", () => {
  it("should display retry button when deployment error is thrown", async () => {
    setup(<Deployment />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Retry/ })).toBeDefined();
    }, { timeout: 5000 });
  });
});

vi.mock("server-only", () => ({}));
