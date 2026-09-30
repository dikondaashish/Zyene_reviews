import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(join(process.cwd(),
  "supabase/migrations/20260930143537_guard_business_member_roles.sql"), "utf8");

describe("business member role boundary", () => {
  it("keeps the trigger on every membership write", () => {
    expect(sql).toMatch(/BEFORE INSERT OR UPDATE OR DELETE ON public\.business_members/i);
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = ''/i);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.guard_business_member_write\(\) FROM PUBLIC, anon, authenticated/i);
  });

  it("rejects another tenant's direct update or deletion without an active actor membership", () => {
    expect(sql).toMatch(/bm\.business_id = OLD\.business_id AND bm\.user_id = actor_id\s+AND bm\.status = 'active'/i);
    expect(sql).toMatch(/actor_role IS NULL OR actor_role NOT IN \('owner', 'admin', 'manager'\)/i);
  });

  it("prevents manager-to-owner and self promotion through direct PostgREST writes", () => {
    expect(sql).toMatch(/OLD\.user_id = actor_id/i);
    expect(sql).toMatch(/NEW\.role = 'owner' AND actor_role <> 'owner'/i);
    expect(sql).toMatch(/actor_role = 'manager' AND \(OLD\.role = 'admin' OR NEW\.role = 'admin'\)/i);
    expect(sql).toMatch(/NEW\.business_id IS DISTINCT FROM OLD\.business_id/i);
    expect(sql).toMatch(/NEW\.user_id IS DISTINCT FROM OLD\.user_id/i);
  });

  it("does not let a manager create another owner or delete an existing owner", () => {
    expect(sql).toMatch(/NEW\.user_id = actor_id AND NEW\.role = 'owner'/i);
    expect(sql).toMatch(/NOT EXISTS \(\s+SELECT 1 FROM public\.business_members bm WHERE bm\.business_id = NEW\.business_id/i);
    expect(sql).toMatch(/OLD\.role = 'owner' OR \(actor_role = 'manager' AND OLD\.role = 'admin'\)/i);
  });
});
