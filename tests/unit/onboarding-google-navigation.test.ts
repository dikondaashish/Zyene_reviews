import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { navigateToGoogleBusinessOAuthOnboarding } from "@/components/onboarding/step2-form-google-oauth-navigate";

const mocks = vi.hoisted(() => ({ prepare: vi.fn(), error: vi.fn() }));
vi.mock("@/app/actions/onboarding/google-oauth-start", () => ({ prepareGoogleOnboardingOAuth: mocks.prepare }));
vi.mock("sonner", () => ({ toast: { error: mocks.error } }));

const businessId = "11111111-1111-4111-8111-111111111111";
const googleUrl = "https://accounts.google.com/o/oauth2/v2/auth?state=test-nonce";
let guard: { current: boolean };
let setPending: Mock<(pending: boolean) => void>;

beforeEach(() => {
    vi.clearAllMocks();
    guard = { current: false };
    setPending = vi.fn<(pending: boolean) => void>();
    vi.stubGlobal("window", { location: { origin: "https://app.zyenereviews.com", href: "" } });
});
afterEach(() => vi.unstubAllGlobals());

describe("Google onboarding navigation", () => {
    it("starts only one OAuth request across rapid clicks and keeps it locked during redirect", async () => {
        let finish!: (result: { success: true; url: string }) => void;
        mocks.prepare.mockReturnValue(new Promise(resolve => { finish = resolve; }));
        const first = navigateToGoogleBusinessOAuthOnboarding(businessId, guard, setPending);
        const second = navigateToGoogleBusinessOAuthOnboarding(businessId, guard, setPending);
        expect(mocks.prepare).toHaveBeenCalledTimes(1);
        expect(mocks.prepare).toHaveBeenCalledWith(businessId, "https://app.zyenereviews.com/onboarding");
        expect(setPending).toHaveBeenCalledExactlyOnceWith(true);
        finish({ success: true, url: googleUrl });
        await Promise.all([first, second]);
        expect(window.location.href).toBe(googleUrl);
        await navigateToGoogleBusinessOAuthOnboarding(businessId, guard, setPending);
        expect(mocks.prepare).toHaveBeenCalledTimes(1);
        expect(guard.current).toBe(true);
        expect(mocks.error).not.toHaveBeenCalled();
    });

    it.each(["server", "network"])("unlocks after a %s failure and allows an explicit retry", async (failure) => {
        if (failure === "network") mocks.prepare.mockRejectedValueOnce(new TypeError("Load failed"));
        else mocks.prepare.mockResolvedValueOnce({ success: false, error: "Permission denied." });
        await navigateToGoogleBusinessOAuthOnboarding(businessId, guard, setPending);
        expect(guard.current).toBe(false);
        expect(setPending.mock.calls).toEqual([[true], [false]]);
        expect(window.location.href).toBe("");
        expect(mocks.error).toHaveBeenCalledWith(failure === "network"
            ? "Unable to start Google connection. Please try again." : "Permission denied.");
        mocks.prepare.mockResolvedValueOnce({ success: true, url: googleUrl });
        await navigateToGoogleBusinessOAuthOnboarding(businessId, guard, setPending);
        expect(mocks.prepare).toHaveBeenCalledTimes(2);
        expect(window.location.href).toBe(googleUrl);
    });
});
