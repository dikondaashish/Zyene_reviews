import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
const script = readFileSync("public/widget-embed.js", "utf8");
function mount(widgetUrl = "https://zyenereviews.com/w/example", position: string | null = null) {
    const frame = { style: { cssText: "", height: "" }, contentWindow: {} };
    const wrapper = { style: { cssText: "" }, appendChild: vi.fn(), isConnected: true };
    const insertBefore = vi.fn();
    const listeners: Record<string, (event?: unknown) => void> = {};
    const window = { innerHeight: 600, addEventListener: (name: string, callback: (event?: unknown) => void) => { listeners[name] = callback; }, removeEventListener: vi.fn() };
    runInNewContext(script, { URL, Number, Math, window,
        MutationObserver: class { observe() {} disconnect() {} },
        document: { documentElement: {}, currentScript: {
            src: "https://zyenereviews.com/widget-embed.js", parentNode: { insertBefore },
            getAttribute: (name: string) => name === "data-widget-url" ? widgetUrl : position,
        }, createElement: (name: string) => name === "iframe" ? frame : wrapper },
    });
    const send = (origin: string, source: unknown, height: unknown, expanded = false) => listeners.message?.({ origin, source, data: { type: "zyene-widget-size", height, expanded } });
    return { frame, insertBefore, send };
}
describe("widget embed message isolation", () => {
    it("rejects embedding an unrelated origin or non-widget route", () => {
        expect(mount("https://evil.example/w/example").insertBefore).not.toHaveBeenCalled();
        expect(mount("https://zyenereviews.com/settings").insertBefore).not.toHaveBeenCalled();
    });
    it("opens a page overlay only for an authenticated message from its own frame and restores inline sizing", () => {
        const { frame, send } = mount();
        send("https://evil.test", frame.contentWindow, 200, true);
        expect(frame.style.cssText).not.toContain("position:fixed");
        send("https://zyenereviews.com", frame.contentWindow, 200, true);
        expect(frame.style.cssText).toContain("position:fixed");
        expect(frame.style.height).toBe("600px");
        send("https://zyenereviews.com", frame.contentWindow, 200, false);
        expect(frame.style.cssText).not.toContain("position:fixed");
        expect(frame.style.height).toBe("200px");
    });
    it("accepts resize only from its own iframe and rejects invalid sizes", () => {
        const { frame, send } = mount();
        send("https://evil.example", frame.contentWindow, 9999);
        send("https://zyenereviews.com", {}, 9999);
        expect(frame.style.height).toBe("");
        send("https://zyenereviews.com", frame.contentWindow, 345.2);
        expect(frame.style.height).toBe("346px");
        send("https://zyenereviews.com", frame.contentWindow, Infinity);
        send("https://zyenereviews.com", frame.contentWindow, "9999");
        expect(frame.style.height).toBe("346px");
    });
    it("keeps an expanded floating badge inside the viewport and shrinks on close", () => {
        const { frame, send } = mount(undefined, "right");
        send("https://zyenereviews.com", frame.contentWindow, 10000);
        expect(frame.style.height).toBe("568px");
        send("https://zyenereviews.com", frame.contentWindow, 144);
        expect(frame.style.height).toBe("144px");
    });
});
