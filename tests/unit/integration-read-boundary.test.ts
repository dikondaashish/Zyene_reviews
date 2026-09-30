import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    displayBusiness,
    displayOrganization,
} from "@/lib/auth/business-context-platforms";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const migration = source(
    "supabase/migrations/20260930143031_restrict_public_integration_reads.sql",
);

describe("integration read boundary", () => {
    it("removes anonymous business and integration reads", () => {
        expect(migration).toContain('DROP POLICY IF EXISTS "Allow public read access" ON public.businesses');
        expect(migration).toContain('DROP POLICY IF EXISTS "Allow public read access" ON public.review_platforms');
        expect(migration).toContain("REVOKE SELECT ON TABLE public.businesses FROM PUBLIC, anon");
        expect(migration).toContain("REVOKE ALL ON TABLE public.review_platforms FROM PUBLIC, anon, authenticated");
    });

    it("only grants authenticated users non-credential integration columns", () => {
        const grant = migration.match(/GRANT SELECT \(([\s\S]*?)\) ON TABLE public\.review_platforms TO authenticated;/)?.[1];
        expect(grant).toBeDefined();
        expect(grant).toContain("business_id");
        expect(grant).toContain("external_url");
        expect(grant).not.toMatch(/\b(?:access_token|refresh_token|sync_state|locked_until)\b/);
        expect(migration).not.toMatch(/GRANT SELECT ON TABLE public\.review_platforms TO authenticated/);
    });

    it("blocks direct client writes to integration rows", () => {
        expect(migration).toContain(
            "REVOKE INSERT, UPDATE, DELETE ON TABLE public.review_platforms FROM PUBLIC, anon, authenticated",
        );
        expect(migration).toContain(
            "GRANT INSERT, UPDATE, DELETE ON TABLE public.review_platforms TO service_role",
        );
    });

    it("never returns cached credential fields to a page, even for the same tenant", () => {
        const platform = {
            id: "platform-a",
            platform: "google",
            sync_status: "active",
            access_token: "ciphertext-a",
            refresh_token: "ciphertext-b",
            sync_state: { opaque: "private" },
        };
        const business = {
            id: "business-a",
            review_platforms: [platform],
        };
        expect(displayBusiness(business).review_platforms).toEqual([{
            id: "platform-a",
            platform: "google",
            sync_status: "active",
        }]);
        expect(displayOrganization({ id: "org-a", businesses: [business] }).businesses?.[0]
            .review_platforms).toEqual([{
                id: "platform-a",
                platform: "google",
                sync_status: "active",
            }]);
    });

    it("queries only display fields in user-facing server payloads", () => {
        expect(source("src/lib/auth/business-context-load.ts")).not.toMatch(/review_platforms\s*\(\s*\*\s*\)/);
        expect(source("src/app/onboarding/load-onboarding-business.ts")).not.toContain("review_platforms(*)");
        expect(source("src/app/actions/onboarding/google-sync.ts")).not.toMatch(/\.from\("review_platforms"\)\s*\.select\("\*"\)/);
    });
});
