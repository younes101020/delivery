import { screen } from "@testing-library/react";
import { http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/../__mocks__/node";

import { DELIVERY_VERSION_URL } from "../__mocks__/handlers";
import { getVersionResolver } from "../__mocks__/resolvers";
import { VersionUpgrade } from "../_components/version-upgrade";
import { setup } from "./utils";

describe("version upgrade", () => {
  it(
    "should display message when current delivery version is already the latest one",
    async () => {
      // Here, let's change the response to /GET /api/version
      // to mock the behavior of a delivery version that is already the latest one
      server.use(
        http.get(DELIVERY_VERSION_URL, getVersionResolver),
      );

      await setup(<VersionUpgrade />);

      expect(screen.getByText("Already up to date")).toBeDefined();
    },
  );
});
