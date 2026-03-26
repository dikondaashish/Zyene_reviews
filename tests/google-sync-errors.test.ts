import { describe, expect, it } from "vitest";
import { mapGoogleSyncError } from "../src/lib/api/google-sync-errors";

describe("mapGoogleSyncError", () => {
  it("maps conflict", () => {
    const result = mapGoogleSyncError({ code: "CONFLICT", message: "lock held" });
    expect(result.status).toBe(409);
    expect(result.code).toBe("CONFLICT");
  });

  it("maps refresh token/reconnect failures to 401", () => {
    const result = mapGoogleSyncError(new Error("No refresh token available - Please reconnect Google Account"));
    expect(result.status).toBe(401);
    expect(result.message).toContain("Authentication expired");
  });

  it("maps missing integration to 404", () => {
    const result = mapGoogleSyncError(new Error("Google platform not connected"));
    expect(result.status).toBe(404);
    expect(result.code).toBe("INTEGRATION_NOT_FOUND");
  });
});

