import { describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
    parseJurisdictionCookie,
    resolveJurisdictionCookie,
    serializeJurisdictionCookie,
    wantsJurisdictionCookie,
} from "@/lib/privacy/jurisdiction-cookie";
import { withPrivacyJurisdiction } from "@/lib/routing/proxy-privacy-jurisdiction";

const base = { secGpc: null, existing: null, queryOverride: null, envOverride: undefined };

describe("jurisdiction cookie", () => {
    it("classifies from Vercel's country header and carries GPC", () => {
        expect(resolveJurisdictionCookie({ ...base, country: "FR", isProduction: true })).toEqual({
            jurisdiction: "EU_EEA",
            gpc: false,
        });
        expect(resolveJurisdictionCookie({ ...base, country: "US", secGpc: "1", isProduction: true })).toEqual({
            jurisdiction: "US",
            gpc: true,
        });
    });

    it("falls back to OTHER (opt-in) when the location is unknown", () => {
        expect(resolveJurisdictionCookie({ ...base, country: null, isProduction: true }).jurisdiction).toBe("OTHER");
    });

    it("never lets a query string or env var relax privacy in production", () => {
        const input = { ...base, country: "DE", queryOverride: "US", envOverride: "US", existing: "US" };
        expect(resolveJurisdictionCookie({ ...input, isProduction: true }).jurisdiction).toBe("EU_EEA");
        expect(resolveJurisdictionCookie({ ...input, country: null, isProduction: true }).jurisdiction).toBe("OTHER");
    });

    it("supports a development override, then remembers it while no geo header exists", () => {
        expect(resolveJurisdictionCookie({ ...base, country: null, queryOverride: "UK", isProduction: false }).jurisdiction).toBe("UK");
        expect(resolveJurisdictionCookie({ ...base, country: null, envOverride: "US", isProduction: false }).jurisdiction).toBe("US");
        expect(resolveJurisdictionCookie({ ...base, country: null, existing: "EU_EEA", isProduction: false }).jurisdiction).toBe("EU_EEA");
        expect(resolveJurisdictionCookie({ ...base, country: null, queryOverride: "nonsense", isProduction: false }).jurisdiction).toBe("OTHER");
    });

    it("round-trips and rejects junk values", () => {
        expect(parseJurisdictionCookie(serializeJurisdictionCookie({ jurisdiction: "US", gpc: true }))).toEqual({
            jurisdiction: "US",
            gpc: true,
        });
        expect(parseJurisdictionCookie("XX")).toBeNull();
        expect(parseJurisdictionCookie(null)).toBeNull();
    });

    it("is only attached to page navigations", () => {
        expect(wantsJurisdictionCookie("/pricing")).toBe(true);
        expect(wantsJurisdictionCookie("/api/stripe/checkout")).toBe(false);
        expect(wantsJurisdictionCookie("/w/acme")).toBe(false);
        expect(wantsJurisdictionCookie("/robots.txt")).toBe(false);
    });
});

describe("proxy: withPrivacyJurisdiction", () => {
    const run = (url: string, headers: Record<string, string>) =>
        withPrivacyJurisdiction(new NextRequest(url, { headers }), NextResponse.next());

    it("sets only the coarse label, readable by JS, and never the country", () => {
        const res = run("https://www.zyenereviews.com/pricing", { host: "www.zyenereviews.com", "x-vercel-ip-country": "IE" });
        const cookie = res.cookies.get("zyene_jurisdiction");
        expect(cookie?.value).toBe("EU_EEA");
        expect(cookie?.httpOnly).toBeFalsy();
        expect(cookie?.domain).toBe(".zyenereviews.com");
        expect(res.headers.get("set-cookie")).not.toContain("IE");
    });

    it("keeps Supabase session cookies and redirects intact (auth is never gated)", () => {
        const response = NextResponse.redirect("https://app.zyenereviews.com/dashboard");
        response.cookies.set("sb-proj-auth-token", "session", { httpOnly: true });
        const req = new NextRequest("https://auth.zyenereviews.com/login", {
            headers: { host: "auth.zyenereviews.com", "x-vercel-ip-country": "DE" },
        });
        const out = withPrivacyJurisdiction(req, response);
        expect(out).toBe(response);
        expect(out.status).toBe(307);
        expect(out.cookies.get("sb-proj-auth-token")?.value).toBe("session");
        expect(out.cookies.get("zyene_jurisdiction")?.value).toBe("EU_EEA");
    });

    it("skips API routes and unchanged values", () => {
        expect(run("https://app.zyenereviews.com/api/x", { "x-vercel-ip-country": "US" }).cookies.get("zyene_jurisdiction")).toBeUndefined();
        const same = run("https://www.zyenereviews.com/", {
            host: "www.zyenereviews.com",
            "x-vercel-ip-country": "US",
            cookie: "zyene_jurisdiction=US",
        });
        expect(same.cookies.get("zyene_jurisdiction")).toBeUndefined();
    });
});
