#!/usr/bin/env node
/**
 * Install curated rules from https://github.com/PatrickJS/awesome-cursorrules (CC0-1.0)
 * into .cursor/rules/ for Zyene Reviews.
 *
 * Usage: node scripts/install-awesome-cursorrules.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULES_DIR = join(ROOT, ".cursor", "rules");
const BASE =
    "https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/main/rules";

/** upstream filename -> local .cursor/rules filename */
const CURATED = {
    "anti-overengineering.mdc": "anti-overengineering.mdc",
    "nextjs15-supabase-cursorrules-prompt-file.mdc": "nextjs15-supabase-security.mdc",
    "nextjs15-react19-vercelai-tailwind-cursorrules-prompt-file.mdc":
        "nextjs15-react-tailwind.mdc",
    "typescript-shadcn-ui-nextjs-cursorrules-prompt-fil.mdc": "shadcn-ui-nextjs.mdc",
    "tanstack-query-v5-cursorrules-prompt-file.mdc": "tanstack-query-v5.mdc",
    "vercel-deployment.mdc": "vercel-deployment.mdc",
    "vitest-unit-testing-cursorrules-prompt-file.mdc": "vitest-testing.mdc",
    "playwright-e2e-testing-cursorrules-prompt-file.mdc": "playwright-e2e.mdc",
};

async function main() {
    await mkdir(RULES_DIR, { recursive: true });

    for (const [upstream, local] of Object.entries(CURATED)) {
        const url = `${BASE}/${upstream}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status}`);
        }
        const body = await res.text();
        await writeFile(join(RULES_DIR, local), body, "utf8");
        console.log(`✓ ${local}`);
    }

    console.log("\nDone. Restart Cursor to load new rules.");
    console.log("Source: https://github.com/PatrickJS/awesome-cursorrules (CC0-1.0)");
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
