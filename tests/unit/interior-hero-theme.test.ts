import { describe, expect, it } from "vitest";
import { getInteriorHeroTheme } from "@/lib/marketing/interior-hero-theme";

describe("interior hero artwork", () => {
    it.each([
        ["/help", "guidance"],
        ["/blog/responding-to-reviews", "guidance"],
        ["/privacy", "guidance"],
        ["/industries/restaurants", "local"],
        ["/es/industries/restaurantes", "local"],
        ["/pricing", "product"],
        ["/features/ai-replies", "product"],
    ] as const)("uses the %s artwork for %s", (pathname, theme) => {
        expect(getInteriorHeroTheme(pathname)).toBe(theme);
    });

    it.each(["/", "/growth", "/growth/plan", "/newsletter/unsubscribe"])("does not decorate %s", (pathname) => {
        expect(getInteriorHeroTheme(pathname)).toBeNull();
    });
});
