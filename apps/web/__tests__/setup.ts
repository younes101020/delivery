import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "../__mocks__/node";
import { EventSource } from "eventsource";
 
beforeAll(async () => {
    const { server } = await import("../__mocks__/node");
    server.listen();
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