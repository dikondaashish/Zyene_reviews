import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("node:dns", () => ({
    promises: { lookup: vi.fn() },
}));

import { promises as dns } from "node:dns";
import { checkOriginIsPublic } from "../../src/services/aeo/crawler/ssrf-guard";

describe("checkOriginIsPublic", () => {
    afterEach(() => vi.resetAllMocks());

    it("rejects an invalid URL", async () => {
        const result = await checkOriginIsPublic("not a url");
        expect(result).toEqual({ safe: false, reason: "Not a valid URL." });
    });

    it("rejects localhost outright, no DNS lookup needed", async () => {
        const result = await checkOriginIsPublic("http://localhost:3000");
        expect(result.safe).toBe(false);
        expect(dns.lookup).not.toHaveBeenCalled();
    });

    it("rejects a literal loopback IP", async () => {
        const result = await checkOriginIsPublic("http://127.0.0.1/");
        expect(result.safe).toBe(false);
    });

    it("rejects the cloud metadata endpoint by literal IP", async () => {
        const result = await checkOriginIsPublic("http://169.254.169.254/latest/meta-data/");
        expect(result.safe).toBe(false);
    });

    it("rejects literal RFC1918 private ranges", async () => {
        expect((await checkOriginIsPublic("http://10.0.0.5/")).safe).toBe(false);
        expect((await checkOriginIsPublic("http://172.16.0.5/")).safe).toBe(false);
        expect((await checkOriginIsPublic("http://192.168.1.5/")).safe).toBe(false);
    });

    it("allows a literal public IP", async () => {
        const result = await checkOriginIsPublic("http://8.8.8.8/");
        expect(result.safe).toBe(true);
    });

    it("rejects a domain that resolves to a private IP (DNS rebinding toward internal infra)", async () => {
        vi.mocked(dns.lookup).mockResolvedValue([{ address: "10.0.0.5", family: 4 }] as never);
        const result = await checkOriginIsPublic("https://internal-service.example.com/");
        expect(result.safe).toBe(false);
        expect(dns.lookup).toHaveBeenCalledWith("internal-service.example.com", { all: true, verbatim: true });
    });

    it("allows a domain that resolves to a public IP", async () => {
        vi.mocked(dns.lookup).mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as never);
        const result = await checkOriginIsPublic("https://example.com/");
        expect(result.safe).toBe(true);
    });

    it("rejects when DNS resolution itself fails", async () => {
        vi.mocked(dns.lookup).mockRejectedValue(new Error("ENOTFOUND"));
        const result = await checkOriginIsPublic("https://does-not-exist.example/");
        expect(result.safe).toBe(false);
    });

    it("rejects an IPv6 loopback", async () => {
        const result = await checkOriginIsPublic("http://[::1]/");
        expect(result.safe).toBe(false);
    });

    it("rejects if EVERY resolved address must be checked and only one is private", async () => {
        vi.mocked(dns.lookup).mockResolvedValue([
            { address: "93.184.216.34", family: 4 },
            { address: "127.0.0.1", family: 4 },
        ] as never);
        const result = await checkOriginIsPublic("https://mixed.example/");
        expect(result.safe).toBe(false);
    });
});
