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
  http.get(DELIVERY_LATEST_URL, () => {
    const total_count = faker.number.int({ min: 0, max: 10 });
    return HttpResponse.json({
      total_count,
    });
  }),
];
