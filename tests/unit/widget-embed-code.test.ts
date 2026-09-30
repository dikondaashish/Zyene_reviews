import { describe, expect, it } from "vitest";
import { buildWidgetEmbeds } from "@/lib/widgets/embed-code";

describe("widget embed code", () => {
    it("uses the public host and matching preview dimensions with accessible iframe titles", () => {
        const embeds = buildWidgetEmbeds("vindu-indian-restaurant", "zyenereviews.com");
        expect(embeds.carousel.url).toBe("https://zyenereviews.com/w/vindu-indian-restaurant");
        expect(embeds.badge.url).toBe(`${embeds.carousel.url}?type=badge`);
        for (const embed of Object.values(embeds)) {
            expect(embed.code).toContain(`height="${embed.height}"`);
            expect(embed.code).toContain(`src="${embed.url}"`);
            expect(embed.code).toContain('title="Customer');
            expect(embed.code).not.toMatch(/frameborder|allowtransparency/);
        }
    });
    it("encodes business slugs instead of allowing HTML attribute injection", () => {
        expect(buildWidgetEmbeds('test" onload="alert(1)', "zyenereviews.com").carousel.code)
            .not.toContain('onload="');
    });
    it("supports local preview hosts", () => {
        expect(buildWidgetEmbeds("example", "localhost:3100").carousel.url)
            .toBe("http://localhost:3100/w/example");
    });
});
