import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Step2FormGoogleConnectPanel } from "@/components/onboarding/step2-form-google-connect-panel";

describe("Google Connect pending state", () => {
    it("disables and announces the connection while an OAuth request is pending", () => {
        const html = renderToStaticMarkup(createElement(Step2FormGoogleConnectPanel, {
            onConnectClick: vi.fn(), pending: true, disabled: false,
        }));
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-busy="true"/);
        expect(html).toContain("Connecting…");
        expect(html).not.toContain("Connect Google Business");
    });

    it("allows connection after pending finishes and blocks it during a manual save", () => {
        const render = (disabled: boolean) => renderToStaticMarkup(createElement(Step2FormGoogleConnectPanel, {
            onConnectClick: vi.fn(), pending: false, disabled,
        }));
        expect(render(false)).toContain("Connect Google Business");
        expect(render(false)).not.toContain('disabled=""');
        expect(render(true)).toMatch(/<button[^>]*disabled=""/);
    });
});
