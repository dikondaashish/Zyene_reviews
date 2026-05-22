import { describe, expect, it } from "vitest";
import {
    DEFAULT_CAL_COM_BOOKING_URL,
    getCalComEmbedUrlFromEnv,
    normalizeCalComEmbedUrl,
} from "../../src/lib/phase8/cal-com-embed";

describe("Cal.com embed URL", () => {
    it("appends embed=true when missing", () => {
        const url = normalizeCalComEmbedUrl("https://cal.com/zyene/enterprise-demo");
        expect(url).toContain("embed=true");
    });

    it("preserves existing embed param", () => {
        const url = normalizeCalComEmbedUrl("https://cal.com/zyene/demo?embed=true");
        expect(url).toBe("https://cal.com/zyene/demo?embed=true");
    });

    it("preserves overlayCalendar and adds embed for zyene demo link", () => {
        const url = normalizeCalComEmbedUrl(DEFAULT_CAL_COM_BOOKING_URL);
        expect(url).toContain("overlayCalendar=true");
        expect(url).toContain("embed=true");
        expect(url).toContain("/zyene/30-min-meeting");
    });

    it("uses default booking URL when env is unset", () => {
        const prev = process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL;
        delete process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL;
        delete process.env.NEXT_PUBLIC_CALENDLY_EMBED_URL;
        const url = getCalComEmbedUrlFromEnv();
        expect(url).toContain("zyene/30-min-meeting");
        if (prev !== undefined) process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL = prev;
    });
});
