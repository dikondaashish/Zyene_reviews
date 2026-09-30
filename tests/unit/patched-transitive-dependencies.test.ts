import { createRequire } from "node:module";
import { readFileSync, realpathSync } from "node:fs";
import { expect, it } from "vitest";

const require = createRequire(import.meta.url);
const shadcnRequire = createRequire(realpathSync("node_modules/shadcn/package.json"));
const yaml = shadcnRequire("yaml") as { parse: (text: string) => {
    packages: Record<string, unknown>;
} };

it("locks every affected package to a patched version and installs the patched runtime", () => {
    const lock = yaml.parse(readFileSync("pnpm-lock.yaml", "utf8"));
    const patched: Record<string, string[]> = {
        axios: ["1.20.0"], "fast-uri": ["3.1.8"], "ip-address": ["10.7.2"],
        "brace-expansion": ["1.1.21", "5.0.12"], next: ["16.3.8"],
    };
    for (const [name, allowed] of Object.entries(patched)) {
        const versions = Object.keys(lock.packages).filter((key) => key.startsWith(`${name}@`))
            .map((key) => key.slice(name.length + 1));
        expect(versions.length, name).toBeGreaterThan(0);
        for (const version of versions) expect(allowed, name).toContain(version);
    }
    const twilioRequire = createRequire(require.resolve("twilio/package.json"));
    expect((twilioRequire("axios/package.json") as { version: string }).version).toBe("1.20.0");
    expect((require("next/package.json") as { version: string }).version).toBe("16.3.8");
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
        pnpm: { overrides: Record<string, string> };
    };
    expect(manifest.pnpm.overrides).toMatchObject({
        "axios@>=1.0.0 <1.20.0": "1.20.0", "fast-uri@>=3.0.0 <3.1.8": "3.1.8",
        "ip-address@>=10.0.0 <10.7.2": "10.7.2",
        "brace-expansion@>=1.0.0 <1.1.21": "1.1.21",
        "brace-expansion@>=4.0.0 <5.0.12": "5.0.12",
    });
});
