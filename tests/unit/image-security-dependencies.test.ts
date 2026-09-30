import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    dependencies: { next: string; sharp: string };
    pnpm: { overrides: Record<string, string> };
};

describe("patched image optimization dependencies", () => {
    it("runs the patched Next and sharp versions and cannot override back to vulnerable sharp", () => {
        expect((require("next/package.json") as { version: string }).version).toBe("16.3.8");
        expect(sharp.versions.sharp).toBe("0.35.4");
        expect(manifest.dependencies.next).toBe("16.3.8");
        expect(manifest.dependencies.sharp).toBe("0.35.4");
        expect(manifest.pnpm.overrides["sharp@<0.35.4"]).toBe("0.35.4");
    });

    it("preserves AVIF encoding and decoding with the upgraded native library", async () => {
        const buffer = await sharp({ create: {
            width: 8, height: 8, channels: 3, background: { r: 20, g: 40, b: 60 },
        } }).avif().toBuffer();
        const image = await sharp(buffer).metadata();
        expect(image.width).toBe(8);
        expect(image.height).toBe(8);
        expect(image.format).toBe("heif");
    });
});
