import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FeatureDemoFrame } from "@/components/marketing/interior/feature-demo-frame";

describe("FeatureDemoFrame", () => {
    it("provides an accessible label and visible sample context", () => {
        const html = renderToStaticMarkup(createElement(
            FeatureDemoFrame,
            {
                label: "AI reply sample",
                caption: "Fictional review. No reply is sent.",
                children: createElement("button", { type: "button" }, "Try a tone"),
            },
        ));

        expect(html).toContain('aria-label="AI reply sample"');
        expect(html).toContain("app.zyenereviews.com");
        expect(html).toContain("Interactive sample");
        expect(html).toContain("Fictional review. No reply is sent.");
        expect(html).toContain("Try a tone");
    });
});
