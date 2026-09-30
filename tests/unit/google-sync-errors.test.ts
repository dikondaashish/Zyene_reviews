import { describe, expect, it } from "vitest";
import { ApiRouteError } from "@/app/api/_shared/errors";
import { mapGoogleSyncError } from "@/lib/api/google-sync-errors";

describe("mapGoogleSyncError", () => {
  it.each([
    [401, "UNAUTHORIZED", "Unauthorized"],
    [400, "INVALID_INPUT", "Invalid sync request"],
    [404, "BUSINESS_NOT_FOUND", "Business record missing"],
    [429, "SYNC_RATE_LIMIT", "Please wait 1 minute"],
  ])("preserves structured route errors with status %i", (status, code, message) => {
    expect(mapGoogleSyncError(new ApiRouteError(message, { status, code })))
      .toEqual({ status, code, message, details: undefined });
  });

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
