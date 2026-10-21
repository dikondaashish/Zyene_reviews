import { afterEach, describe, expect, it, vi } from "vitest";
import { formatInboundAddress, inboundDomains, inboundToken, newAddressToken } from "@/lib/enrollment/inbound-address";
import { isPublicProviderEntry } from "@/lib/enrollment/inbound-email-parse";

afterEach(() => { vi.unstubAllEnvs(); });

describe("invoice-copy enrollment addresses", () => {
    it("issues the business name plus a short unambiguous code", () => {
        const token = newAddressToken("Willow Hair Studio!");
        expect(token).toMatch(/^willow-hair-studio-[a-hj-km-np-z2-9]{4}$/);
        expect(formatInboundAddress(token, "in.zyenereviews.com")).toBe(`${token}@in.zyenereviews.com`);
        expect(newAddressToken("x".repeat(100)).length).toBeLessThanOrEqual(63);
        expect(newAddressToken("!!!")).toMatch(/^reviews-[a-z2-9]{4}$/);
    });

    it("keeps legacy reviews-<hex> addresses working", () => {
        const hex = "3f9a1c0b7e2d4a6f8b1c9e0d";
        expect(formatInboundAddress(hex, "in.zyenereviews.com")).toBe(`reviews-${hex}@in.zyenereviews.com`);
        expect(inboundToken(`reviews-${hex}@inbound.zyenereviews.com`, ["in.zyenereviews.com", "inbound.zyenereviews.com"])).toBe(hex);
    });

    it("reads current addresses on our domains only", () => {
        expect(inboundToken("Willow-Hair-Studio-K7M2@IN.zyenereviews.com", "in.zyenereviews.com")).toBe("willow-hair-studio-k7m2");
        expect(inboundToken("willow-hair-studio-k7m2@evil.test", "in.zyenereviews.com")).toBeNull();
        expect(inboundToken("willow-hair-studio@in.zyenereviews.com", "in.zyenereviews.com")).toBeNull();
    });

    it("accepts the current domain plus older ones", () => {
        vi.stubEnv("INBOUND_EMAIL_DOMAIN", "in.zyenereviews.com");
        vi.stubEnv("INBOUND_EMAIL_LEGACY_DOMAINS", " inbound.zyenereviews.com ,");
        expect(inboundDomains()).toEqual(["in.zyenereviews.com", "inbound.zyenereviews.com"]);
    });

    it("rejects whole public-provider allowed senders but not exact addresses", () => {
        expect(isPublicProviderEntry("@gmail.com")).toBe(true);
        expect(isPublicProviderEntry(" @Outlook.com ")).toBe(true);
        expect(isPublicProviderEntry("owner@gmail.com")).toBe(false);
        expect(isPublicProviderEntry("@willowhair.com")).toBe(false);
    });
});
