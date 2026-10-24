import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { appSidebarNavItemIsActive } from "@/components/dashboard/app-sidebar-nav-utils";
import { GET_REVIEWS_URLS } from "@/components/dashboard/get-reviews-tabs";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("Get reviews navigation", () => {
    it("groups campaigns, requests and automations", () => {
        expect(GET_REVIEWS_URLS).toEqual(["/campaigns", "/requests", "/automations"]);
    });

    it("keeps Get reviews active on every page and sub-page in the group", () => {
        for (const pathname of ["/campaigns", "/campaigns/new", "/requests", "/automations", "/automations/calendar"]) {
            expect(appSidebarNavItemIsActive(pathname, "/campaigns", GET_REVIEWS_URLS)).toBe(true);
        }
        expect(appSidebarNavItemIsActive("/reviews", "/campaigns", GET_REVIEWS_URLS)).toBe(false);
        expect(appSidebarNavItemIsActive("/requestsx", "/campaigns", GET_REVIEWS_URLS)).toBe(false);
    });

    it("keeps Requests, Campaigns, Automations and Integrations as their own sidebar items", () => {
        const nav = source("src/components/dashboard/use-app-sidebar-nav.ts");
        expect(nav).not.toContain("dict.nav.get_reviews");
        for (const url of ["/requests", "/campaigns", "/automations"]) expect(nav).toContain(`url: "${url}"`);
        expect(nav.indexOf('url: "/settings/integrations"')).toBeLessThan(nav.indexOf("settingsItems"));
    });

    it("shows the shared tabs on all three pages", () => {
        expect(source("src/app/(dashboard)/campaigns/page-client.tsx")).toContain('<GetReviewsTabs active="/campaigns" />');
        expect(source("src/app/(dashboard)/requests/page-view.tsx")).toContain('<GetReviewsTabs active="/requests" />');
        expect(source("src/components/automations/automations-overview-view.tsx")).toContain('<GetReviewsTabs active="/automations" />');
    });
});
