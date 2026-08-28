import { describe, expect, it } from "vitest";
import {
    customTagsForSave,
    formatTagForDisplay,
    parseTagsToItems,
    resolveReviewFlowTags,
    sanitizeTagItems,
    splitTagEmojiAndLabel,
    tagsMatchCategoryDefaults,
} from "../../src/lib/review-flow/tag-display";
import { tagsForAi } from "../../src/lib/review-flow/tags-for-ai";
import { getDefaultTagsForCategory } from "../../src/lib/review-flow/category-tags";

describe("tag-display", () => {
    it("splits emoji prefix from category defaults", () => {
        expect(splitTagEmojiAndLabel("🍽️ Food")).toEqual({ emoji: "🍽️", label: "Food" });
    });

    it("auto-icons plain owner tags", () => {
        const result = formatTagForDisplay("Professional", "service");
        expect(result.emoji).toBe("👔");
        expect(result.label).toBe("Professional");
        expect(result.display).toBe("👔 Professional");
    });

    it("maps duct-cleaning style labels", () => {
        expect(formatTagForDisplay("Before & After Photos", "service").emoji).toBe("📸");
        expect(formatTagForDisplay("Fast & Reliable", "service").emoji).toBe("⚡");
    });

    it("resolveReviewFlowTags uses defaults when custom empty", () => {
        const tags = resolveReviewFlowTags(null, "restaurant");
        expect(tags[0]).toContain("Food");
        expect(tags[0]).toMatch(/^[^\s]+\s/);
    });

    it("ice cream shops get flavor and mix-in tags instead of restaurant food", () => {
        const tags = resolveReviewFlowTags(null, "ice_cream");
        expect(tags).toContain("🍦 Flavor");
        expect(tags).toContain("🧁 Mix-ins");
        expect(tags).toContain("❄️ Made Fresh");
        expect(tags.some((t) => t.includes("Food") || t.includes("Portions"))).toBe(false);
    });

    it("resolveReviewFlowTags auto-icons custom plain tags", () => {
        const tags = resolveReviewFlowTags(["Friendly", "Cleanliness"], "service");
        expect(tags).toContain("🤝 Friendly");
        expect(tags).toContain("🧹 Cleanliness");
    });

    it("parseTagsToItems seeds from category when stored is empty", () => {
        const items = parseTagsToItems(null, "restaurant");
        expect(items.length).toBe(getDefaultTagsForCategory("restaurant").length);
        expect(items[0].emoji.length).toBeGreaterThan(0);
    });

    it("customTagsForSave returns null when matching defaults", () => {
        const items = parseTagsToItems(null, "other");
        expect(customTagsForSave(items, "other")).toBeNull();
    });

    it("customTagsForSave persists when labels differ from defaults", () => {
        const items = parseTagsToItems(["My Custom Tag"], "other");
        expect(customTagsForSave(items, "other")).toEqual(["⭐ My Custom Tag"]);
    });

    it("tagsMatchCategoryDefaults detects edits", () => {
        const defaults = parseTagsToItems(null, "service");
        const edited = defaults.map((item, i) =>
            i === 0 ? { ...item, label: "Changed", display: `${item.emoji} Changed`, raw: `${item.emoji} Changed` } : item
        );
        expect(tagsMatchCategoryDefaults(defaults, "service")).toBe(true);
        expect(tagsMatchCategoryDefaults(edited, "service")).toBe(false);
    });

    it("sanitizeTagItems drops empty and duplicate labels", () => {
        const items = parseTagsToItems(["Friendly", "Friendly", ""], "service");
        const extra = { ...items[0], label: "", display: "⭐", raw: "" };
        const sanitized = sanitizeTagItems([...items, extra]);
        expect(sanitized).toHaveLength(1);
        expect(sanitized[0].label).toBe("Friendly");
    });

    it("sanitizeTagItems caps stored display length at 80 chars", () => {
        const longLabel = "a".repeat(90);
        const sanitized = sanitizeTagItems([
            { emoji: "⭐", label: longLabel, raw: longLabel, display: longLabel },
        ]);
        expect(sanitized[0].display.length).toBeLessThanOrEqual(80);
    });

    it("tagsForAi strips emoji from auto-icon display tags", () => {
        const parsed = tagsForAi(["👔 Professional", "🤝 Friendly"]);
        expect(parsed.mode).toBe("specific");
        if (parsed.mode === "specific") {
            expect(parsed.presets).toEqual(["Professional", "Friendly"]);
        }
    });
});
