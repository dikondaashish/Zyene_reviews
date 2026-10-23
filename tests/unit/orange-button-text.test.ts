import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Product rule: text on an orange button is white in every state, even when a call site restyled it. */
describe("orange button text", () => {
    const css = readFileSync("src/app/dashboard-colors.css", "utf8");

    it.each(["hover", "active"])("turns the text white when a default button goes orange on %s", (state) => {
        const rule = css.match(new RegExp(`\\[data-variant="default"\\]:${state}:not\\(:disabled\\)[^{]*\\{([^}]*)\\}`));
        expect(rule?.[1]).toMatch(/color:\s*var\(--primary-foreground\)/);
    });

    it("keeps white as the text colour on primary and CTA fills", () => {
        const globals = readFileSync("src/app/globals.css", "utf8");
        expect(globals).toMatch(/--primary-foreground:\s*#ffffff/);
        expect(css).toMatch(/--primary-foreground:\s*#ffffff/);
    });
});

describe("marketing CTA colour", () => {
    it("fills website buttons with the brand orange #ed5a29", () => {
        const css = readFileSync("src/app/(marketing)/marketing.css", "utf8");
        expect(css).toMatch(/--cta:#ed5a29;/);
        expect(css).toMatch(/--cta-foreground:#ffffff;/);
    });
});

describe("underline tabs", () => {
    it("shows no grey bar under a hovered inactive tab", () => {
        const globals = readFileSync("src/app/globals.css", "utf8");
        expect(globals).toMatch(
            /\[data-slot="tabs-list"\]\[data-variant="line"\] \[data-slot="tabs-trigger"\]\[data-state="inactive"\]:hover \{\s*box-shadow: none;/,
        );
    });
});
