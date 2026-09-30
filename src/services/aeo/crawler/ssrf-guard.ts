import { promises as dns } from "node:dns";
import { BlockList, isIP } from "node:net";

/**
 * `origin` for a crawl is `businesses.website` - data the business OWNER
 * controls, not a value we chose. Until a live trigger existed nothing could
 * ever reach `crawlSite()`, so this gap was structural but unreachable; a
 * manual or scheduled trigger makes it a real SSRF vector - a tenant could
 * point their own "website" at cloud metadata (169.254.169.254) or an
 * internal service and have OUR server fetch it on their behalf. This is
 * checked in the worker (aeo-crawl-worker.ts), not just the UI action, so it
 * applies to every trigger path, present and future.
 *
 * Resolves DNS and checks every returned address against private/reserved
 * ranges. User-controlled outbound HTTP also validates again inside its
 * connection lookup; this preflight alone is not a DNS-rebinding defense.
 */

const blockedAddresses = new BlockList();
for (const [network, prefix] of [
    ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
    ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
    ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
    ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
    ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blockedAddresses.addSubnet(network, prefix, "ipv4");
for (const [network, prefix] of [
    ["::", 96], ["::1", 128], ["64:ff9b::", 96], ["64:ff9b:1::", 48], ["100::", 64],
    ["2001::", 23], ["2001:db8::", 32], ["2002::", 16],
    ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8],
] as const) blockedAddresses.addSubnet(network, prefix, "ipv6");

export function isPublicIp(address: string): boolean {
    const family = isIP(address);
    if (family === 0) return false;
    return !blockedAddresses.check(address, family === 4 ? "ipv4" : "ipv6");
}

export async function resolvePublicAddress(hostname: string): Promise<{ address: string; family: 4 | 6 }> {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    if (records.length === 0 || records.some((record) => !isPublicIp(record.address))) {
        throw new Error("Host does not resolve only to public addresses");
    }
    const record = records[0];
    if (record.family !== 4 && record.family !== 6) throw new Error("Unsupported address family");
    return { address: record.address, family: record.family };
}

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"]);

export type OriginSafetyResult = { safe: true } | { safe: false; reason: string };

export async function checkOriginIsPublic(origin: string): Promise<OriginSafetyResult> {
    let hostname: string;
    try {
        // URL#hostname keeps the brackets around an IPv6 literal ("[::1]"),
        // which node:net's isIP() does not recognize - stripped here once,
        // rather than risking an IPv6 literal silently falling through to
        // the "not a literal IP, go resolve DNS" branch unrecognized.
        const url = new URL(origin);
        if (!(["http:", "https:"].includes(url.protocol)) || url.username || url.password) {
            return { safe: false, reason: "Only public HTTP(S) URLs are allowed." };
        }
        hostname = url.hostname.replace(/^\[|\]$/g, "");
    } catch {
        return { safe: false, reason: "Not a valid URL." };
    }

    const lowerHost = hostname.toLowerCase().replace(/\.$/, "");
    if (BLOCKED_HOSTNAMES.has(lowerHost) || lowerHost.endsWith(".local") ||
        lowerHost.endsWith(".localhost") || lowerHost.endsWith(".internal") ||
        (isIP(hostname) === 0 && !hostname.includes("."))) {
        return { safe: false, reason: "This host is not a public internet address." };
    }

    const ipVersion = isIP(hostname);
    if (ipVersion === 4 && !isPublicIp(hostname)) {
        return { safe: false, reason: "This address is a private or reserved IP, not a public website." };
    }
    if (ipVersion === 6 && !isPublicIp(hostname)) {
        return { safe: false, reason: "This address is a private or reserved IP, not a public website." };
    }

    if (ipVersion === 0) {
        try {
            await resolvePublicAddress(hostname);
        } catch {
            return { safe: false, reason: "This domain does not resolve only to public addresses." };
        }
    }

    return { safe: true };
}
