import { describe, expect, it } from "vitest";

import { getOnboardingStepMotion } from "@/app/onboarding/onboarding-step-motion";

describe("getOnboardingStepMotion", () => {
    it("moves the incoming step up while fading it in", () => {
        expect(getOnboardingStepMotion(false)).toEqual({
            initial: { opacity: 0, y: 18 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
            transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
        });
    });

    it("removes movement when the user prefers reduced motion", () => {
        expect(getOnboardingStepMotion(true)).toEqual({
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: { opacity: 1 },
            transition: { duration: 0 },
        });
    });
});
