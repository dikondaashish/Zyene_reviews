import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { HELP_ARTICLES } from "@/lib/content/help-data";
import { onboardingHelpFor } from "@/lib/onboarding/onboarding-help";

describe("onboarding Get help", () => {
    it("links every step to a help article that exists", () => {
        const known = new Set(HELP_ARTICLES.map((a) => `/${a.category}/${a.slug}`));
        for (const step of [1, 2, 3, 4, 5, 6, 7]) {
            const help = onboardingHelpFor(step);
            const articlePath = help.articleUrl.replace("https://www.zyenereviews.com/help", "");
            expect(known.has(articlePath), `step ${step}: ${articlePath}`).toBe(true);
        }
    });

    it("emails support with the step in the subject", () => {
        expect(onboardingHelpFor(4).emailUrl).toBe("mailto:support@zyenereviews.com?subject=Help%20with%20setup%3A%20Plan%20step");
        expect(onboardingHelpFor(99).stepName).toBe("Connect");
    });

    it("is part of the onboarding layout, so every step shows it", () => {
        const layout = readFileSync(path.join(process.cwd(), "src/app/onboarding/layout.tsx"), "utf8");
        expect(layout).toContain("<OnboardingHelpButton />");
    });
});
