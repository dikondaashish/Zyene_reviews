import { describe, expect, it } from "vitest";
import {
  canManageCompetitorWatchSettings,
  canManageCompetitors,
  isBusinessOwnerOrAdmin,
} from "../../src/lib/competitors/watch-access";

describe("watch-access", () => {
  it("allows owner and admin only", () => {
    expect(isBusinessOwnerOrAdmin("owner")).toBe(true);
    expect(isBusinessOwnerOrAdmin("admin")).toBe(true);
    expect(isBusinessOwnerOrAdmin("member")).toBe(false);
    expect(isBusinessOwnerOrAdmin(null)).toBe(false);
    expect(isBusinessOwnerOrAdmin(undefined)).toBe(false);
  });

  it("aliases match settings and competitor CRUD", () => {
    expect(canManageCompetitorWatchSettings("owner")).toBe(true);
    expect(canManageCompetitors("admin")).toBe(true);
    expect(canManageCompetitors("member")).toBe(false);
  });
});
