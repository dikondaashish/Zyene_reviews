import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Product rule: every star is a solid shape, never outlined (see globals.css `svg.lucide-star`). */
function tsxFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === "ui" ? [] : tsxFiles(path);
        return path.endsWith(".tsx") ? [path] : [];
    });
}

describe("star icons", () => {
    it("keeps the global rule that fills stars and removes their outline", () => {
        const css = readFileSync("src/app/globals.css", "utf8");
        expect(css).toMatch(/svg\.lucide-star\s*\{\s*fill:\s*currentColor;\s*stroke:\s*none;/);
    });

    it("never gives a star an outline-only or two-tone look", () => {
        const offenders = tsxFiles("src").flatMap((file) =>
            (readFileSync(file, "utf8").match(/<Star\b[^>]*>/g) ?? [])
                .filter((tag) => /fill="none"|fill-none|fill-muted|strokeWidth=\{[^0]|stroke-|text-warning-foreground/.test(tag))
                .map((tag) => `${file}: ${tag}`),
        );
        expect(offenders).toEqual([]);
    });
});
