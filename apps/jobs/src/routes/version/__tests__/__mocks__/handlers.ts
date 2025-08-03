import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";

import { DELIVERY_LATEST_URL } from "../../lib/github/const";

export default [
  http.get(DELIVERY_LATEST_URL, () => {
    const tag_name = `v${faker.system.semver()}`;
    return HttpResponse.json({
      tag_name,
    });
  }),
];
