import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), fetch: vi.fn() }));

vi.mock("node:dns", () => ({ promises: { lookup: mocks.lookup } }));
vi.mock("undici", () => ({
    Agent: class {
        constructor(public options: { connect: { lookup: (
            hostname: string, options: object, callback: (error: Error | null, address: string, family: number) => void,
        ) => void } }) {}
        async close() {}
    },
    fetch: mocks.fetch,
}));

import { fetchPublicHttpText } from "@/services/aeo/crawler/public-http";

describe("public HTTP transport DNS binding", () => {
    afterEach(() => vi.resetAllMocks());

    it("blocks a public-to-private DNS rebind at the connection lookup", async () => {
        mocks.lookup.mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }]);
        mocks.lookup.mockResolvedValueOnce([{ address: "169.254.169.254", family: 4 }]);
        mocks.fetch.mockImplementation(async (_url, options) => {
            await new Promise<void>((resolve, reject) => {
                options.dispatcher.options.connect.lookup("rebinding.example.com", {}, (error: Error | null) => {
                    if (error) reject(error); else resolve();
                });
            });
            return new Response("unreachable");
        });

        await expect(fetchPublicHttpText("https://rebinding.example.com/")).rejects.toThrow(
            "public addresses",
        );
        expect(mocks.lookup).toHaveBeenCalledTimes(2);
    });

    it("blocks a private literal before any network request", async () => {
        await expect(fetchPublicHttpText("http://169.254.169.254/")).rejects.toThrow();
        expect(mocks.fetch).not.toHaveBeenCalled();
    });
});
