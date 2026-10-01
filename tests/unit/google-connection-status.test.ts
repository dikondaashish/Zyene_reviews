import { describe, expect, it } from "vitest";
import { getGoogleConnectionStatus, googleAuthNeedsReconnect } from "@/lib/google/is-google-connected";

const platform = { platform: "google", google_location_id: "location-1", sync_status: "idle" };

describe("Google connection status", () => {
    it("does not ask users to reconnect for a generic sync failure", () => {
        expect(googleAuthNeedsReconnect("error")).toBe(false);
        expect(getGoogleConnectionStatus([{ ...platform, sync_status: "error" }])).toBe("connected");
    });

    it("asks to reconnect only when the refresh credential is missing or revoked", () => {
        expect(googleAuthNeedsReconnect("error_no_refresh_token")).toBe(true);
        expect(googleAuthNeedsReconnect("error_token_revoked")).toBe(true);
        expect(getGoogleConnectionStatus([{ ...platform, sync_status: "error_token_revoked" }])).toBe("needs_reconnect");
    });
});
