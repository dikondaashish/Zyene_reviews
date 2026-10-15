import { describe, expect, it } from "vitest";
import { isGoogleSyncConflictError, isGoogleSyncCooldownError } from "../../src/services/google/sync-lock-utils";

describe("isGoogleSyncConflictError", () => {
  it("detects CONFLICT code and message", () => {
    expect(isGoogleSyncConflictError({ code: "CONFLICT", message: "x" })).toBe(true);
    expect(isGoogleSyncConflictError(new Error("Sync already in progress."))).toBe(true);
    expect(isGoogleSyncConflictError(new Error("other"))).toBe(false);
  });
});

describe("isGoogleSyncCooldownError", () => {
  it("detects the post-sync cooldown error only", () => {
    expect(isGoogleSyncCooldownError({ code: "RATE_LIMIT", message: "Please wait before syncing again." })).toBe(true);
    // Google API rate limits share the code but are real failures.
    expect(isGoogleSyncCooldownError({ code: "RATE_LIMIT", message: "Google API Rate Limit Exceeded" })).toBe(false);
    expect(isGoogleSyncCooldownError(new Error("Sync already in progress."))).toBe(false);
  });
});
