import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ launch: vi.fn() }));
vi.mock("puppeteer-core", () => ({ default: { launch: mocks.launch } }));
vi.mock("@sparticuz/chromium", () => ({ default: { args: [], executablePath: vi.fn() } }));

import { renderVisibleText } from "@/services/aeo/technical-audit/headless-renderer";

describe("headless render egress boundary", () => {
    const original = process.env.AEO_HEADLESS_RENDER_ISOLATED_EGRESS;

    afterEach(() => {
        process.env.AEO_HEADLESS_RENDER_ISOLATED_EGRESS = original;
        mocks.launch.mockClear();
    });

    it("does not launch a network-capable browser without isolated egress", async () => {
        delete process.env.AEO_HEADLESS_RENDER_ISOLATED_EGRESS;
        await expect(renderVisibleText("https://example.com/")).rejects.toThrow("isolated outbound network");
        expect(mocks.launch).not.toHaveBeenCalled();
    });
});
