import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { emailPreviews } from "../fixtures/email-previews";

const previews = emailPreviews();
const widths = [320, 375, 430, 768, 1366];
for (const width of widths) {
    for (const mode of ["light", "dark", "inline-only", "outlook-dark"] as const) {
        test(`${width}px ${mode}: all email templates`, async ({ page }, testInfo) => {
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ colorScheme: mode === "dark" ? "dark" : "light" });
            // All external assets are deliberately blocked: emails must be readable without images.
            await page.route("**/*", route => route.abort());
            for (const preview of previews) {
                let html = mode === "inline-only" ? preview.html.replace(/<style>[\s\S]*?<\/style>/gi, "") : preview.html;
                if (mode === "outlook-dark") html = html.replace("<body ", '<body data-ogsc="" ');
                await page.setContent(html, { waitUntil: "domcontentloaded" });
                const issues = await page.evaluate(() => {
                    const issues: string[] = [];
                    if (document.documentElement.scrollWidth > innerWidth + 1) issues.push(`horizontal overflow: ${document.documentElement.scrollWidth}`);
                    for (const cell of document.querySelectorAll("td,th")) {
                        const parent = cell.parentElement?.tagName;
                        if (parent !== "TR") issues.push("invalid table cell");
                    }
                    for (const a of document.querySelectorAll("a")) {
                        if (!a.getAttribute("href") || a.getAttribute("href") === "#") issues.push("empty destination");
                        if (a.classList.contains("email-cta") && a.getBoundingClientRect().height < 44) issues.push("button is shorter than 44px");
                    }
                    const luminance = (rgb: number[]) => rgb.slice(0, 3).map(c => c / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
                        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
                    const rgb = (color: string) => color.match(/[\d.]+/g)?.map(Number) ?? [255, 255, 255];
                    for (const el of document.querySelectorAll("h1,h2,h3,p,a,li,td,th")) {
                        if (![...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) || !(el as HTMLElement).offsetHeight) continue;
                        const style = getComputedStyle(el);
                        let background = [255, 255, 255];
                        let ancestor: Element | null = el;
                        while (ancestor) {
                            const color = rgb(getComputedStyle(ancestor).backgroundColor);
                            if (color.length === 3 || color[3] > 0) { background = color; break; }
                            ancestor = ancestor.parentElement;
                        }
                        const fg = luminance(rgb(style.color)); const bg = luminance(background);
                        const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
                        const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
                        if (ratio < (large ? 3 : 4.5) - 0.05) issues.push(`contrast ${ratio.toFixed(2)}: ${el.textContent?.trim().slice(0, 45)}`);
                    }
                    return issues;
                });
                expect(issues, `${preview.id} at ${width}px / ${mode}`).toEqual([]);
                if (testInfo.project.name === "chromium" && ["light", "dark"].includes(mode) && [375, 1366].includes(width)) {
                    const folder = "output/email-audit/screenshots";
                    mkdirSync(folder, { recursive: true });
                    await page.screenshot({ path: `${folder}/${preview.id}-${width}-${mode}.png`, fullPage: true });
                }
            }
        });
    }
}
