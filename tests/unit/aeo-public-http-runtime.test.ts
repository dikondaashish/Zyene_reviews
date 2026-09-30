import { createServer } from "node:http";
import { getDefaultAutoSelectFamily, setDefaultAutoSelectFamily } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

// Only synthetic loopback traffic is allowed in this transport compatibility test.
vi.mock("@/services/aeo/crawler/ssrf-guard", () => ({
    checkOriginIsPublic: async () => ({ safe: true }),
    resolvePublicAddress: async () => ({ address: "127.0.0.1", family: 4 }),
}));

import { fetchPublicHttpText } from "@/services/aeo/crawler/public-http";

describe("public HTTP transport runtime", () => {
    const originalAutoSelect = getDefaultAutoSelectFamily();
    afterEach(() => setDefaultAutoSelectFamily(originalAutoSelect));

    it("connects through the vetted lookup with Node family autoselection enabled", async () => {
        setDefaultAutoSelectFamily(true);
        const server = createServer((_request, response) => response.end("synthetic-response"));
        await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") throw new Error("No test server address");
            const result = await fetchPublicHttpText(`http://fixture.example:${address.port}`, { maxBytes: 9 });
            expect(result).toMatchObject({ ok: true, status: 200, text: "synthetic" });
        } finally {
            server.closeAllConnections();
            await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
        }
    });
});
