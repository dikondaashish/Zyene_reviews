import { describe, expect, it } from "vitest";
import { isGoogleSyncConflictError } from "../../src/services/google/sync-lock-utils";

describe("isGoogleSyncConflictError", () => {
  it("detects CONFLICT code and message", () => {
    expect(isGoogleSyncConflictError({ code: "CONFLICT", message: "x" })).toBe(true);
    expect(isGoogleSyncConflictError(new Error("Sync already in progress."))).toBe(true);
    expect(isGoogleSyncConflictError(new Error("other"))).toBe(false);
  });
});
