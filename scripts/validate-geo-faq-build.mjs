/**
 * Validates FAQPage JSON-LD after `pnpm build`.
 *
 * Next.js 16 / Turbopack often does not emit flat `.next/server/app/<route>.rsc`
 * files. This script:
 * 1. Discovers any static RSC/HTML/segment artifacts (legacy + route groups).
 * 2. Falls back to HTTP against a local `next start` server when static output
 *    does not contain FAQ payloads (same checks as production validator).
 *
 * Usage: node scripts/validate-geo-faq-build.mjs
 * Env:
 *   GEO_VALIDATE_BUILD_BASE — use an already-running server (skip spawn)
 *   GEO_VALIDATE_BUILD_PORT — port for spawned server (default 3099)
 *   GEO_VALIDATE_BUILD_SKIP_SERVER=1 — static-only (fails if no static FAQ data)
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
    CHECKS,
    ROOT,
    extractFaqQuestionNames,
    fetchPageHtml,
    resolveBuildArtifacts,
    staticPayloadSufficient,
    validateCheckPayload,
} from "./lib/validate-geo-faq-core.mjs";

const BUILD_ID_PATH = path.join(ROOT, ".next/BUILD_ID");
const DEFAULT_PORT = Number(process.env.GEO_VALIDATE_BUILD_PORT ?? "3099");
const SKIP_SERVER = process.env.GEO_VALIDATE_BUILD_SKIP_SERVER === "1";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(base, attempts = 90) {
    for (let i = 0; i < attempts; i++) {
        try {
            const res = await fetch(`${base}/`, {
                headers: { "User-Agent": "Zyene-GEO-Validator/1.0" },
                redirect: "follow",
                signal: AbortSignal.timeout(8_000),
            });
            if (res.ok) return;
        } catch {
            // retry until next start is ready
        }
        await sleep(1_000);
    }
    throw new Error(`server not ready at ${base}`);
}

function startNextServer(port) {
    const child = spawn("pnpm", ["exec", "next", "start", "-H", "127.0.0.1", "-p", String(port)], {
        cwd: ROOT,
        env: { ...process.env, NODE_ENV: "production", PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
    });
    child.stderr?.on("data", (chunk) => {
        const line = String(chunk);
        if (line.includes("Ready") || line.includes("Error") || line.includes("EADDRINUSE")) {
            process.stderr.write(line);
        }
    });
    return child;
}

let failed = 0;

if (!fs.existsSync(BUILD_ID_PATH)) {
    console.error("Missing .next/BUILD_ID — run `pnpm build` first.");
    process.exit(1);
}

console.log("GEO FAQ build validation\n");

const needsHttp = [];
const staticResults = new Map();

for (const check of CHECKS) {
    const artifacts = resolveBuildArtifacts(check.path);
    if (staticPayloadSufficient(check, artifacts.combined)) {
        staticResults.set(check.path, {
            html: artifacts.combined,
            source: `static (${artifacts.files.length} file(s))`,
        });
    } else {
        needsHttp.push(check);
    }
}

let base = process.env.GEO_VALIDATE_BUILD_BASE?.replace(/\/$/, "");
let serverChild = null;

if (needsHttp.length > 0 && !SKIP_SERVER) {
    if (!base) {
        base = `http://127.0.0.1:${DEFAULT_PORT}`;
        serverChild = startNextServer(DEFAULT_PORT);
        try {
            await waitForServer(base);
            console.log(`Local server ready at ${base} (next start)\n`);
        } catch (e) {
            serverChild.kill("SIGTERM");
            console.error(e.message);
            process.exit(1);
        }
    } else {
        console.log(`Using GEO_VALIDATE_BUILD_BASE=${base}\n`);
        await waitForServer(base);
    }
} else if (needsHttp.length > 0) {
    console.error(
        "Static build artifacts lack FAQ payloads and GEO_VALIDATE_BUILD_SKIP_SERVER=1 — cannot validate."
    );
    process.exit(1);
}

try {
    for (const check of CHECKS) {
        let html = "";
        let source = "unknown";
        const cached = staticResults.get(check.path);
        if (cached) {
            html = cached.html;
            source = cached.source;
        } else if (base) {
            try {
                ({ html } = await fetchPageHtml(base, check.path));
                source = `http (${base})`;
            } catch (e) {
                failed++;
                console.log(`FAIL ${check.label}`);
                console.log(`  - fetch failed: ${e.message}`);
                continue;
            }
        } else {
            failed++;
            console.log(`FAIL ${check.label}`);
            console.log("  - no static payload and no server base");
            continue;
        }

        const { pass, issues, meta } = validateCheckPayload({ html, source, check });
        if (!pass) failed++;
        console.log(`${pass ? "PASS" : "FAIL"} ${check.label}`);
        console.log(
            `  - source: ${meta.source}, bytes: ${meta.bytes}, ld+json tags: ${meta.ldJson ? "yes" : "no (RSC payload only)"}`
        );
        for (const i of issues) console.log(`  - ${i}`);
        if (pass && check.expectFaq > 0) {
            const names = extractFaqQuestionNames(html);
            console.log(`  - FAQPage: 1 block, ${names.length} Q&A, matches visible UI`);
        }
    }
} finally {
    if (serverChild) {
        serverChild.kill("SIGTERM");
    }
}

console.log(`\n${CHECKS.length - failed}/${CHECKS.length} passed`);
process.exit(failed > 0 ? 1 : 0);
