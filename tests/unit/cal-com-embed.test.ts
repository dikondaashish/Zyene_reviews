import { describe, expect, it } from "vitest";
import {
    DEFAULT_CAL_COM_BOOKING_URL,
    getCalComEmbedUrlFromEnv,
    normalizeCalComEmbedUrl,
} from "../../src/lib/enterprise/cal-com-embed";

describe("Cal.com embed URL", () => {
    it("appends embed=true when missing", () => {
        const url = normalizeCalComEmbedUrl("https://cal.com/zyenereviews/enterprise-demo");
        expect(url).toContain("embed=true");
    });

    it("preserves existing embed param", () => {
        const url = normalizeCalComEmbedUrl("https://cal.com/zyenereviews/demo?embed=true");
        expect(url).toBe("https://cal.com/zyenereviews/demo?embed=true");
    });

    it("preserves query params and adds embed for demo link", () => {
        const url = normalizeCalComEmbedUrl("https://cal.com/zyenereviews/15min?overlayCalendar=true");
        expect(url).toContain("overlayCalendar=true");
        expect(url).toContain("embed=true");
        expect(url).toContain("/zyenereviews/15min");
    });

    it("adds embed for default booking URL", () => {
        const url = normalizeCalComEmbedUrl(DEFAULT_CAL_COM_BOOKING_URL);
        expect(url).toBe("https://cal.com/zyenereviews/15min?embed=true");
    });

    it("uses default booking URL when env is unset", () => {
        const prev = process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL;
        delete process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL;
        delete process.env.NEXT_PUBLIC_CALENDLY_EMBED_URL;
        const url = getCalComEmbedUrlFromEnv();
        expect(url).toContain("zyenereviews/15min");
        if (prev !== undefined) process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL = prev;
    });
});
