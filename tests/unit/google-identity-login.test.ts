import { describe, expect, it } from "vitest";
import {
    buildGoogleAuthCompletionPath,
    createGoogleIdentityNonce,
} from "@/lib/auth/google-identity";

describe("Google Identity login", () => {
    it("creates matching raw and SHA-256 nonce values", async () => {
        const { nonce, hashedNonce } = await createGoogleIdentityNonce();

        expect(nonce.length).toBeGreaterThan(32);
        expect(hashedNonce).toMatch(/^[a-f0-9]{64}$/);

        const digest = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(nonce)
        );
        const expectedHash = Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");

        expect(hashedNonce).toBe(expectedHash);
    });

    it("preserves a team invitation in the completion path", () => {
        expect(buildGoogleAuthCompletionPath(" invite-token ", "/settings/team")).toBe(
            "/api/auth/google/complete?next=%2Fsettings%2Fteam&invite=invite-token"
        );
    });

    it("omits an empty invitation from the completion path", () => {
        expect(buildGoogleAuthCompletionPath(null)).toBe(
            "/api/auth/google/complete?next=%2Fdashboard",
        );
    });
});
