import { Ratelimit as UpstashRatelimit, type RatelimitConfig } from "@upstash/ratelimit";

/** Upstash treats its timeout as success; cost/abuse guards must not. */
export class Ratelimit extends UpstashRatelimit {
    constructor(config: RatelimitConfig) {
        super(config);
        const limit = this.limit;
        this.limit = async (...args) => {
            const result = await limit(...args);
            if (result.reason === "timeout") throw new Error("Rate limit storage timed out");
            return result;
        };
    }
}
