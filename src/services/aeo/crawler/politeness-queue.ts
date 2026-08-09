/**
 * E-3: ≤1 request/second to any one host, regardless of how many pages a
 * crawl needs. The plan doc's own politeness limit, and the whole reason a
 * customer's small site should never notice a real crawl against it.
 *
 * Per-HOST, not global: a crawl fetching pages from one origin is naturally
 * sequential already (nothing here parallelizes across pages), so this is a
 * floor on spacing between consecutive requests, not a scheduler.
 */
export class PolitenessQueue {
    private lastRequestAt = new Map<string, number>();

    constructor(private readonly minIntervalMs = 1000) {}

    /** Resolves once it is safe to issue the next request to `host`. */
    async waitForTurn(host: string): Promise<void> {
        const last = this.lastRequestAt.get(host);
        const now = Date.now();
        if (last !== undefined) {
            const elapsed = now - last;
            if (elapsed < this.minIntervalMs) {
                await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
            }
        }
        this.lastRequestAt.set(host, Date.now());
    }
}
