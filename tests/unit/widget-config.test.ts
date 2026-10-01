import { describe, expect, it } from "vitest";
import { parseWidgetConfig, encodeWidgetConfig } from "@/lib/widgets/config";
import { WIDGET_TEMPLATES } from "@/lib/widgets/templates";
import { buildConfiguredEmbed } from "@/lib/widgets/configured-embed";
import { WIDGET_COLORS } from "@/lib/widgets/palette";

describe("configurable review widgets", () => {
    it("preserves measured reference colors in serialized settings", () => {
        const channels = (color: string) => [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
        const config = parseWidgetConfig(null);
        expect(channels(config.accent)).toEqual([51, 102, 255]);
        expect(channels(config.stars)).toEqual([251, 188, 4]);
        expect(channels(WIDGET_COLORS.lightCard)).toEqual([245, 245, 247]);
        expect(channels(WIDGET_COLORS.darkBackground)).toEqual([0, 0, 0]);
    });
    it("round trips every template into an installable widget", () => {
        expect(WIDGET_TEMPLATES).toHaveLength(20);
        for (const template of WIDGET_TEMPLATES) {
            const config = parseWidgetConfig(template.config);
            const embed = buildConfiguredEmbed("vindu", config, "zyenereviews.com");
            expect(parseWidgetConfig(new URL(embed.url).searchParams.get("config"))).toEqual(config);
            expect(embed.code).toContain("/widget-embed.js");
            expect(embed.code).toContain("data-widget-url=");
        }
    });
    it("uses the canonical host so redirects cannot break resize origin checks", () => {
        const config = parseWidgetConfig(null);
        expect(new URL(buildConfiguredEmbed("demo", config, "zyenereviews.com").url).origin).toBe("https://www.zyenereviews.com");
        expect(new URL(buildConfiguredEmbed("demo", config, "www.zyenereviews.com").url).origin).toBe("https://www.zyenereviews.com");
        expect(new URL(buildConfiguredEmbed("demo", config, "localhost:3100").url).origin).toBe("http://localhost:3100");
    });
    it("rejects CSS injection and bounds expensive rendering options", () => {
        const config = parseWidgetConfig({ accent: 'red; background:url(https://evil.test)', limit: 99999, columns: 100 });
        expect(config.accent).toBe(WIDGET_COLORS.accent);
        expect(config.limit).toBeLessThanOrEqual(100);
        expect(config.columns).toBeLessThanOrEqual(6);
    });
    it("uses the observed template hierarchy instead of reusing unrelated layouts", () => {
        const template = (id: string) => parseWidgetConfig(WIDGET_TEMPLATES.find(t => t.id === id)?.config);
        expect(template("floating")).toMatchObject({ layout: "card-badge", floating: true, position: "left" });
        expect(template("sidebar")).toMatchObject({ layout: "carousel", columns: 1, width: 340, theme: "outline", showButton: false });
        expect(template("dark-carousel")).toMatchObject({ reviewStyle: "bubble", showHeader: false, background: WIDGET_COLORS.darkBackground });
        expect(template("simple")).toMatchObject({ theme: "outline", sourceStyle: "inline", showPhotos: true });
        expect(template("halloween")).toMatchObject({ theme: "dark", stars: WIDGET_COLORS.stars, showVerified: false });
    });
    it("recovers malformed or oversized configuration and ignores privilege options", () => {
        expect(parseWidgetConfig("{broken")).toEqual(parseWidgetConfig(null));
        expect(parseWidgetConfig("x".repeat(10000))).toEqual(parseWidgetConfig(null));
        expect(parseWidgetConfig({ hideBranding: true, businessId: "other" })).not.toHaveProperty("hideBranding");
    });
    it("encodes untrusted titles as data, never executable embed attributes", () => {
        const config = parseWidgetConfig({ title: '\"/><script>alert(1)</script>' });
        expect(parseWidgetConfig(encodeWidgetConfig(config)).title).toBe(config.title);
        expect(buildConfiguredEmbed('slug\" onload=\"evil', config, "zyenereviews.com").code).not.toContain("<script>alert");
        expect(buildConfiguredEmbed("demo", config, "zyenereviews.com").code).not.toContain('onload="');
    });
});
