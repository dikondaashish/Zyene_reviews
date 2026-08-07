import { describe, expect, it } from "vitest";

import {
    GBP_SCOPE,
    GOOGLE_CONNECT_SCOPES,
    GOOGLE_SEARCH_CONSOLE_SCOPES,
    SEARCH_CONSOLE_SCOPE,
    grantIncludesSearchConsole,
} from "../../src/services/google/oauth-scopes";

describe("the default connect flow is unchanged by the GSC work", () => {
    /**
     * The load-bearing property. webmasters.readonly is a SENSITIVE scope, and
     * adding it to the primary consent screen sends that screen back through
     * Google verification — during which the business.manage consent every
     * customer needs can be shown as unverified or blocked. Bundling them would
     * risk the core review product to add a reporting feature.
     */
    it("does NOT request Search Console during a normal Google connect", () => {
        expect(GOOGLE_CONNECT_SCOPES).not.toContain("webmasters");
    });

    it("still requests exactly what the review product needs", () => {
        expect(GOOGLE_CONNECT_SCOPES).toBe(
            "openid email profile https://www.googleapis.com/auth/business.manage"
        );
    });
});

describe("incremental Search Console consent", () => {
    it("carries the existing GBP scope alongside the new one", () => {
        // Google returns a token carrying only the scopes named in the request.
        // Omitting business.manage would hand back a token that can read Search
        // Console but can no longer read reviews.
        expect(GOOGLE_SEARCH_CONSOLE_SCOPES).toContain(GBP_SCOPE);
        expect(GOOGLE_SEARCH_CONSOLE_SCOPES).toContain(SEARCH_CONSOLE_SCOPE);
    });

    it("asks only for read access, never write", () => {
        // Nothing in this product writes to Search Console; requesting the
        // writable scope would be claiming authority we never exercise, and it
        // raises the verification bar for no benefit.
        expect(SEARCH_CONSOLE_SCOPE).toBe("https://www.googleapis.com/auth/webmasters.readonly");
        expect(GOOGLE_SEARCH_CONSOLE_SCOPES).not.toMatch(/auth\/webmasters(\s|$)/);
    });
});

describe("grantIncludesSearchConsole", () => {
    const GBP_ONLY = "openid email profile https://www.googleapis.com/auth/business.manage";

    it("is false for a grant that never included it", () => {
        expect(grantIncludesSearchConsole(GBP_ONLY)).toBe(false);
    });

    it("treats an unknown grant as NOT granted", () => {
        // NULL means "we never observed what was granted" — every row predating
        // the granted_scopes column. Optimism here shows a customer an empty
        // Search Console panel that reads as "no data" rather than "not connected".
        expect(grantIncludesSearchConsole(null)).toBe(false);
        expect(grantIncludesSearchConsole(undefined)).toBe(false);
        expect(grantIncludesSearchConsole("")).toBe(false);
    });

    it("is true once the readonly scope is present", () => {
        expect(grantIncludesSearchConsole(`${GBP_ONLY} ${SEARCH_CONSOLE_SCOPE}`)).toBe(true);
    });

    it("accepts the writable scope as implying read access", () => {
        expect(
            grantIncludesSearchConsole(`${GBP_ONLY} https://www.googleapis.com/auth/webmasters`)
        ).toBe(true);
    });

    it("matches whole scopes, not substrings", () => {
        // A substring check is how an app convinces itself it holds `webmasters`
        // when a lookalike scope merely contains the word.
        expect(
            grantIncludesSearchConsole("https://www.googleapis.com/auth/webmasters.readonly.fake")
        ).toBe(false);
        expect(grantIncludesSearchConsole("webmasters")).toBe(false);
    });

    it("tolerates irregular whitespace in the grant string", () => {
        expect(grantIncludesSearchConsole(`  ${SEARCH_CONSOLE_SCOPE}   ${GBP_SCOPE}  `)).toBe(true);
    });
});
