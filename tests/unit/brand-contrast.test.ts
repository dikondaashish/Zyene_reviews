import { describe, expect, it } from "vitest";
import { contrastRatio, readableForeground } from "@/lib/design/contrast";

describe("public brand color contrast", () => {
    it.each(["#ff4f00", "#fff", "#123", "#00ff00", "#663399", "#777777"])("keeps button text readable on %s", color => {
        expect(contrastRatio(color, readableForeground(color))).toBeGreaterThanOrEqual(4.5);
    });
    it("uses the semantic foreground for a semantic color", () => {
        expect(readableForeground("var(--primary)")).toBe("var(--primary-foreground)");
    });
});
