import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  finalize: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

// Run every effect synchronously, in declaration order, like a first client render.
vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
vi.mock("@/app/actions/onboarding", () => ({ finalizeOnboardingStripeCheckout: mocks.finalize }));
vi.mock("@/lib/analytics/signup-events", () => ({ trackSignupEvent: vi.fn() }));
vi.mock("@/lib/analytics/meta-trial-events", () => ({ trackMetaStartTrial: vi.fn() }));
vi.mock("@/app/onboarding/google-oauth-callback", () => ({
  getGoogleOAuthCallbackOutcome: () => ({ kind: "none" }),
}));

import { useOnboardingUrlEffects } from "@/app/onboarding/use-onboarding-url-effects";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

function renderEffects(search: string, pending: boolean) {
  const storage = memoryStorage();
  if (pending) storage.setItem("zyene_payment_pending", "true");
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("document", { title: "Onboarding" });
  vi.stubGlobal("window", {
    location: { search, pathname: "/onboarding" },
    history: { replaceState: vi.fn() },
  });
  const setters = {
    setCurrentStep: vi.fn(),
    setPendingGoogleCode: vi.fn(),
    setGoogleConnectionError: vi.fn(),
    setIsStepResolved: vi.fn(),
    setShowPaymentCancelled: vi.fn(),
    setCheckoutVerifying: vi.fn(),
  };
  // Effects are mocked to run synchronously, so the hook runs outside React here.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useOnboardingUrlEffects(setters);
  return { setters, storage };
}

const cancelledShown = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.some(([v]) => v === true);

describe("onboarding payment-pending flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.finalize.mockResolvedValue({ success: true });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("does not show 'payment cancelled' after a successful checkout", async () => {
    const { setters, storage } = renderEffects("?checkout_success=1&session_id=cs_1", true);
    await vi.waitFor(() => expect(setters.setCurrentStep).toHaveBeenCalledWith(7));
    expect(cancelledShown(setters.setShowPaymentCancelled)).toBe(false);
    expect(storage.getItem("zyene_payment_pending")).toBeNull();
  });

  it("does not show 'payment cancelled' after a successful in-place plan switch", async () => {
    const { setters, storage } = renderEffects("?checkout_success=1&plan_switched=1", true);
    await vi.waitFor(() => expect(setters.setCurrentStep).toHaveBeenCalledWith(7));
    expect(cancelledShown(setters.setShowPaymentCancelled)).toBe(false);
    expect(storage.getItem("zyene_payment_pending")).toBeNull();
  });

  it("shows 'payment cancelled' when Stripe returns with checkout_canceled", () => {
    const { setters, storage } = renderEffects("?checkout_canceled=1", true);
    expect(cancelledShown(setters.setShowPaymentCancelled)).toBe(true);
    expect(setters.setCurrentStep).toHaveBeenCalledWith(4);
    expect(storage.getItem("zyene_payment_pending")).toBeNull();
  });

  it("shows 'payment cancelled' when the user comes back without finishing checkout", () => {
    const { setters, storage } = renderEffects("", true);
    expect(cancelledShown(setters.setShowPaymentCancelled)).toBe(true);
    expect(storage.getItem("zyene_payment_pending")).toBeNull();
  });

  it("shows nothing on a normal visit with no pending checkout", () => {
    const { setters } = renderEffects("", false);
    expect(cancelledShown(setters.setShowPaymentCancelled)).toBe(false);
  });
});
