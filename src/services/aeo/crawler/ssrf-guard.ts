import { promises as dns } from "node:dns";
import { isIP } from "node:net";

/**
 * `origin` for a crawl is `businesses.website` — data the business OWNER
 * controls, not a value we chose. Until a live trigger existed nothing could
 * ever reach `crawlSite()`, so this gap was structural but unreachable; a
 * manual or scheduled trigger makes it a real SSRF vector — a tenant could
 * point their own "website" at cloud metadata (169.254.169.254) or an
 * internal service and have OUR server fetch it on their behalf. This is
 * checked in the worker (aeo-crawl-worker.ts), not just the UI action, so it
 * applies to every trigger path, present and future.
 *
 * Resolves DNS and checks every returned address against private/reserved
 * ranges. This does not close a DNS-rebinding TOCTOU window (the resolved IP
 * could theoretically change between this check and the crawler's own
 * fetches) — a fully bulletproof fix would pin the resolved IP and connect
 * to it directly, which `fetch()` does not support without a custom
 * dispatcher. Flagged as a real, known residual gap rather than claimed as
 * fully closed.
 */

function isPrivateOrReservedIPv4(ip: string): boolean {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true; // fail closed on garbage
    const [a, b] = parts;
    if (a === 127) return true; // loopback
    if (a === 10) return true; // RFC1918
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 169 && b === 254) return true; // link-local, includes the 169.254.169.254 cloud metadata endpoint
    if (a === 0) return true;
    if (a >= 224) return true; // multicast / reserved
    return false;
}

function isPrivateOrReservedIPv6(ip: string): boolean {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80:")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    if (lower.startsWith("::ffff:")) {
        const v4 = lower.split(":").pop();
        if (v4 && isIP(v4) === 4) return isPrivateOrReservedIPv4(v4);
    }
    return false;
}

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"]);

export type OriginSafetyResult = { safe: true } | { safe: false; reason: string };

export async function checkOriginIsPublic(origin: string): Promise<OriginSafetyResult> {
    let hostname: string;
    try {
        // URL#hostname keeps the brackets around an IPv6 literal ("[::1]"),
        // which node:net's isIP() does not recognize — stripped here once,
        // rather than risking an IPv6 literal silently falling through to
        // the "not a literal IP, go resolve DNS" branch unrecognized.
        hostname = new URL(origin).hostname.replace(/^\[|\]$/g, "");
    } catch {
        return { safe: false, reason: "Not a valid URL." };
    }

    const lowerHost = hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(lowerHost) || lowerHost.endsWith(".local")) {
        return { safe: false, reason: "This host is not a public internet address." };
    }

    const ipVersion = isIP(hostname);
    if (ipVersion === 4 && isPrivateOrReservedIPv4(hostname)) {
        return { safe: false, reason: "This address is a private or reserved IP, not a public website." };
    }
    if (ipVersion === 6 && isPrivateOrReservedIPv6(hostname)) {
        return { safe: false, reason: "This address is a private or reserved IP, not a public website." };
    }

    if (ipVersion === 0) {
        let records: { address: string; family: number }[];
        try {
            records = await dns.lookup(hostname, { all: true, verbatim: true });
        } catch {
            return { safe: false, reason: "This domain could not be resolved." };
        }
        if (records.length === 0) return { safe: false, reason: "This domain does not resolve." };
        for (const rec of records) {
            if (rec.family === 4 && isPrivateOrReservedIPv4(rec.address)) {
                return { safe: false, reason: "This domain resolves to a private network address." };
            }
            if (rec.family === 6 && isPrivateOrReservedIPv6(rec.address)) {
                return { safe: false, reason: "This domain resolves to a private network address." };
            }
        }
    }

    return { safe: true };
}
