import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
const artifacts = resolve(process.cwd(), "output/email-audit");
export default defineConfig({
    testDir: ".", testMatch: "*.spec.ts", timeout: 120_000, workers: 1,
    reporter: [["list"], ["html", { outputFolder: `${artifacts}/playwright-report`, open: "never" }]],
    outputDir: `${artifacts}/test-results`,
    projects: [{ name: "chromium", use: { browserName: "chromium" } }, { name: "webkit", use: { browserName: "webkit" } }],
});
