import { describe, expect, it } from "vitest";

import { PolitenessQueue } from "../../src/services/aeo/crawler/politeness-queue";

describe("PolitenessQueue", () => {
    it("does not delay the first request to a host", async () => {
        const queue = new PolitenessQueue(50);
        const start = Date.now();
        await queue.waitForTurn("example.com");
        expect(Date.now() - start).toBeLessThan(20);
    });

    it("delays a second request to the SAME host until the interval has passed", async () => {
        const queue = new PolitenessQueue(50);
        await queue.waitForTurn("example.com");
        const start = Date.now();
        await queue.waitForTurn("example.com");
        expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });

    it("does not delay a request to a DIFFERENT host", async () => {
        const queue = new PolitenessQueue(50);
        await queue.waitForTurn("example.com");
        const start = Date.now();
        await queue.waitForTurn("other.com");
        expect(Date.now() - start).toBeLessThan(20);
    });

    it("does not re-delay a request that already waited long enough naturally", async () => {
        const queue = new PolitenessQueue(30);
        await queue.waitForTurn("example.com");
        await new Promise((r) => setTimeout(r, 50));
        const start = Date.now();
        await queue.waitForTurn("example.com");
        expect(Date.now() - start).toBeLessThan(20);
    });
});
