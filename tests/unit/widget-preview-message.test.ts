import { describe, expect, it } from "vitest";
import { trustedWidgetPreviewMessage } from "@/lib/widgets/preview-message";

describe("widget preview configuration messages", () => {
    const parent = {};
    const message = { source: parent, origin: "https://app.zyenereviews.com", data: { type: "zyene-widget-config" } };
    it("accepts the owning dashboard or same-origin local preview", () => {
        expect(trustedWidgetPreviewMessage(message, parent, "https://www.zyenereviews.com")).toBe(true);
        expect(trustedWidgetPreviewMessage({ ...message, origin: "http://localhost:3100" }, parent, "http://localhost:3100")).toBe(true);
    });
    it("rejects foreign hosts, sibling frames, and unrelated message types", () => {
        expect(trustedWidgetPreviewMessage({ ...message, origin: "https://evil.test" }, parent, "https://www.zyenereviews.com")).toBe(false);
        expect(trustedWidgetPreviewMessage({ ...message, source: {} }, parent, "https://www.zyenereviews.com")).toBe(false);
        expect(trustedWidgetPreviewMessage({ ...message, data: { type: "save-business" } }, parent, "https://www.zyenereviews.com")).toBe(false);
    });
});
