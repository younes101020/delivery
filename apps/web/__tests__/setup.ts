import { beforeAll, afterEach, afterAll } from "vitest";
import { setupMocks } from "./mocks/utils";
import { server } from "./mocks/server";
 
beforeAll(() => setupMocks())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())