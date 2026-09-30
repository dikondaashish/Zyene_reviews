import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(join(process.cwd(),
    "supabase/migrations/20260930143541_restrict_platform_sync_lock.sql"), "utf8");

describe("platform sync lock grants", () => {
    it("denies anonymous and authenticated callers even with a known platform ID", () => {
        expect(sql).toMatch(/auth\.role\(\) IS DISTINCT FROM 'service_role'/i);
        expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.acquire_platform_lock\(uuid, interval\)\s+FROM PUBLIC, anon, authenticated/i);
        expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.acquire_platform_lock\(uuid, interval\) TO service_role/i);
    });

    it("bounds lock duration and pins the definer search path", () => {
        expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = ''/i);
        expect(sql).toMatch(/UPDATE public\.review_platforms/i);
        expect(sql).toMatch(/p_lock_duration < interval '1 minute'/i);
        expect(sql).toMatch(/p_lock_duration > interval '30 minutes'/i);
    });
});
