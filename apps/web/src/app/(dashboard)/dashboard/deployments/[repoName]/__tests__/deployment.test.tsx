import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, describe, it, vi } from "vitest";

import { DEPLOYED_APP } from "./const";
// import { setup } from "./utils";

describe("deployments", () => {
  beforeAll(() => {
    vi.mock("next/navigation", () => ({
      usePathname: vi.fn().mockReturnValue(DEPLOYED_APP),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it(
    "",
    () => {
      // const { userAction } = setup(< />);
    },
  );
});
