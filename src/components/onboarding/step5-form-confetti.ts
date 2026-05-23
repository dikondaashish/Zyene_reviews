export async function fireOnboardingConfetti() {
    try {
        const confettiModule = await import("canvas-confetti");
        const confetti = confettiModule.default;
        const root = document.documentElement;
        const cs = getComputedStyle(root);
        const themeColors = (["--chart-1", "--chart-2", "--chart-3", "--chart-4"] as const).reduce<
            string[]
        >((acc, v) => {
            const value = cs.getPropertyValue(v).trim();
            if (value) acc.push(value);
            return acc;
        }, []);
        const colors =
            themeColors.length >= 4
                ? themeColors
                : [cs.getPropertyValue("--primary").trim(), cs.getPropertyValue("--sync-action").trim()].filter(
                      Boolean,
                  );
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: colors.length ? colors : undefined,
        });
    } catch {
        // Optional visual effect failed; onboarding flow can continue.
    }
}
