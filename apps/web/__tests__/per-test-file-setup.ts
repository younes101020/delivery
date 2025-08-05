import { beforeAll, afterEach, afterAll, vi, beforeEach } from "vitest";
import { server } from "../__mocks__/node";
import { EventSource } from "eventsource";
import { QueryCache } from "@tanstack/react-query";

const queryCache = new QueryCache()
 
beforeAll(async () => {
    server.listen();

    const IntersectionObserverMock = vi.fn(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: vi.fn(),
        unobserve: vi.fn(),
    }));
    vi.mock("next/font/google", () => ({
        Roboto: () => ({
            className: "mocked-font",
            style: { fontFamily: "Roboto" }
        })
    }));
    vi.mock("server-only", () => ({}));
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    vi.stubGlobal("ResizeObserver", IntersectionObserverMock);
    vi.stubGlobal("EventSource", EventSource);
    vi.mock("next/navigation", async (importOriginal) => {
        return {
            ...await importOriginal<typeof import("next/navigation")>(),
            usePathname: vi.fn().mockReturnValue("/dashboard/deployments/my-app"),
            useSearchParams: () => ({
                get: vi.fn().mockReturnValue(""),
            }),
        };
    });
});
beforeEach(() => queryCache.clear())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())