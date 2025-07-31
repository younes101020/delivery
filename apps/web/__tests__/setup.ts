import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { setupMocks } from "./mocks/utils";
import { server } from "./mocks/server";
import { EventSource } from "eventsource";
 
beforeAll(() => {
    setupMocks()
    const IntersectionObserverMock = vi.fn(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: vi.fn(),
        unobserve: vi.fn(),
    }))
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    vi.stubGlobal("ResizeObserver", IntersectionObserverMock);
    vi.stubGlobal("EventSource", EventSource);
    vi.mock("next/navigation", async (importOriginal) => {
        return {
            ...await importOriginal<typeof import("next/navigation")>(),
            usePathname: vi.fn().mockReturnValue("/dashboard/deployments/my-app"),
        };
    });
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())