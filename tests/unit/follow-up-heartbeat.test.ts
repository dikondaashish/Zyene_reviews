import { afterEach, describe, expect, it, vi } from "vitest";
import { pingFollowUpHeartbeat } from "@/lib/monitoring/follow-up-heartbeat";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("follow-up-heartbeat", () => {
    it("does not send a heartbeat when its private URL is unset", async () => {
        vi.stubEnv("BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL", "");
        vi.stubGlobal("fetch", vi.fn());
        await pingFollowUpHeartbeat(true);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("GETs the configured base URL on success", async () => {
        vi.stubEnv("BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL", "https://example.com/hb/ping");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
        await pingFollowUpHeartbeat(true);
        expect(fetch).toHaveBeenCalledWith("https://example.com/hb/ping",
            expect.objectContaining({ method: "GET", cache: "no-store" }));
    });

    it("GETs the configured /fail path on failure", async () => {
        vi.stubEnv("BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL", "https://example.com/hb/ping");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
        await pingFollowUpHeartbeat(false);
        expect(fetch).toHaveBeenCalledWith("https://example.com/hb/ping/fail",
            expect.objectContaining({ method: "GET" }));
    });

    it("swallows fetch errors", async () => {
        vi.stubEnv("BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL", "https://example.com/hb/ping");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
        await expect(pingFollowUpHeartbeat(true)).resolves.toBeUndefined();
    });
});
