import { describe, expect, it } from "vitest";
import {
    getAuthSiteOrigin,
    getAuthSiteUrl,
    getAppSiteOrigin,
    isAuthPageRoute,
} from "@/lib/routing/platform-routes";
import { buildTeamInviteSignupLink } from "@/lib/team/deliver-team-invite-email";
import { safeNextPath } from "@/lib/routing/safe-next-path";

describe("auth domain routing", () => {
    it("builds production auth URLs on the auth subdomain", () => {
        expect(getAuthSiteUrl("zyenereviews.com", "/login")).toBe(
            "https://auth.zyenereviews.com/login"
        );
        expect(getAuthSiteUrl("www.zyenereviews.com", "/signup")).toBe(
            "https://auth.zyenereviews.com/signup"
        );
    });

    it("keeps auth paths on the localhost origin during development", () => {
        expect(getAuthSiteOrigin("localhost:3000")).toBe("http://localhost:3000");
        expect(getAuthSiteUrl("localhost:3000", "/forgot-password")).toBe(
            "http://localhost:3000/forgot-password"
        );
    });

    it("normalizes a legacy marketing app URL to the app subdomain", () => {
        expect(
            getAppSiteOrigin("zyenereviews.com", "https://zyenereviews.com")
        ).toBe("https://app.zyenereviews.com");
        expect(
            getAppSiteOrigin("zyenereviews.com", "https://app.zyenereviews.com/")
        ).toBe("https://app.zyenereviews.com");
    });

    it("recognizes only auth page routes", () => {
        expect(isAuthPageRoute("/login")).toBe(true);
        expect(isAuthPageRoute("/signup")).toBe(true);
        expect(isAuthPageRoute("/reset-password")).toBe(true);
        expect(isAuthPageRoute("/pricing")).toBe(false);
        expect(isAuthPageRoute("/api/auth/callback")).toBe(false);
    });

    it("sends team invitations to the auth signup host", () => {
        const previousRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "zyenereviews.com";

        try {
            expect(buildTeamInviteSignupLink("invite value")).toBe(
                "https://auth.zyenereviews.com/signup?invite=invite%20value"
            );
        } finally {
            if (previousRootDomain === undefined) {
                delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
            } else {
                process.env.NEXT_PUBLIC_ROOT_DOMAIN = previousRootDomain;
            }
        }
    });

    it("accepts in-app return paths and rejects external redirects", () => {
        expect(safeNextPath("/settings/team?tab=invites")).toBe("/settings/team?tab=invites");
        expect(safeNextPath("https://evil.example/phish")).toBe("/dashboard");
        expect(safeNextPath("//evil.example/phish")).toBe("/dashboard");
        expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    });
});
