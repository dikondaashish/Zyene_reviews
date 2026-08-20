import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260819230000_business_milestones_customer_identity.sql"),
  "utf8",
);
const authFix = fs.readFileSync(
  path.join(root, "supabase/migrations/20260820160000_fix_claim_review_milestone_auth.sql"),
  "utf8",
);
const component = fs.readFileSync(
  path.join(root, "src/components/dashboard/milestone-celebration.tsx"),
  "utf8",
);

describe("milestone persistence", () => {
  it("seeds every business from its current visible review count", () => {
    expect(migration).toContain("count(r.id)::integer");
    expect(migration).toContain("r.is_visible = true");
    expect(migration).toContain("last_milestone_reached = v_current_count");
  });

  it("claims milestones atomically and no longer trusts browser storage", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(component).toContain("/api/milestones/reviews/claim");
    expect(component).not.toContain("localStorage");
  });

  it("authorizes claim_review_milestone via org or business membership", () => {
    expect(authFix).toContain("organization_members");
    expect(authFix).toContain("business_members");
    expect(authFix).toContain("pg_catalog.hashtextextended");
  });
});
