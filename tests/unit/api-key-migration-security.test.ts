import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
    join(
        process.cwd(),
        "supabase/migrations/20260819220000_secure_zapier_api_keys.sql",
    ),
    "utf8",
);

describe("secure API-key migration", () => {
    it("hashes legacy keys, clears plaintext, and prevents it returning", () => {
        expect(migration).toContain("extensions.digest(rp.external_id::BYTEA, 'sha256')");
        expect(migration).toMatch(/UPDATE public\.review_platforms[\s\S]*SET external_id = NULL/);
        expect(migration).toContain("review_platforms_api_external_id_must_be_null");
        expect(migration).toMatch(/UPDATE public\.integrations[\s\S]*SET api_key = NULL[\s\S]*platform = 'zapier'/);
        expect(migration).toContain("integrations_zapier_api_key_must_be_null");
    });

    it("audits lifecycle events without the secret or hash", () => {
        const auditFunction = migration.match(
            /CREATE OR REPLACE FUNCTION public\.audit_api_key_lifecycle\(\)[\s\S]*?\$\$;/,
        )?.[0] ?? "";

        expect(auditFunction).toContain("api_key.created");
        expect(auditFunction).toContain("api_key.rotated");
        expect(auditFunction).toContain("api_key.revoked");
        expect(auditFunction).toContain("NEW.key_prefix");
        expect(auditFunction).not.toContain("NEW.key_hash");
        expect(auditFunction).not.toContain("NEW.external_id");
    });
});
