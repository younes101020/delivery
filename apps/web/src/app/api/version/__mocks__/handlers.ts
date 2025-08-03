import { http, HttpResponse } from "msw";

export default [
  http.get(/\/version/, () => {
    console.log("Mocked GET /version request");
    return HttpResponse.json({
      version: "1.0.0",
      imageDigest: "sha256:1234567890abcdef",
      isLatest: true,
    });
  }),
];
