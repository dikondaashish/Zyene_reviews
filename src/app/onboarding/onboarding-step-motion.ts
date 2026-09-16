import type { Target, Transition } from "framer-motion";

type OnboardingStepMotion = {
    initial: Target;
    animate: Target;
    exit: Target;
    transition: Transition;
};

const stepEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function getOnboardingStepMotion(reduceMotion: boolean): OnboardingStepMotion {
    if (reduceMotion) {
        return {
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: { opacity: 1 },
            transition: { duration: 0 },
        };
    }

    return {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.26, ease: stepEase },
    };
}
