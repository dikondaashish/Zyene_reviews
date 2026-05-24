#!/usr/bin/env node
/**
 * Sync .agents/skills/* to IDE-specific skill folders via relative symlinks.
 *
 * Usage: node scripts/sync-agent-skills.mjs
 *   or:  pnpm run skills:sync
 *
 * Targets: .claude/skills, .windsurf/skills
 * Canonical source: .agents/skills (also used by Cursor via skills CLI)
 */

import { lstat, mkdir, readdir, readFile, rm, symlink } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SOURCE = join(ROOT, ".agents", "skills");

/** @type {readonly string[]} */
const TARGETS = [
    join(ROOT, ".claude", "skills"),
    join(ROOT, ".windsurf", "skills"),
];

async function isSymlink(path) {
    try {
        const stat = await lstat(path);
        return stat.isSymbolicLink();
    } catch {
        return false;
    }
}

async function validateSkill(skillDir, name) {
    const skillFile = join(skillDir, "SKILL.md");
    let content;
    try {
        content = await readFile(skillFile, "utf8");
    } catch {
        throw new Error(`Missing SKILL.md: ${name}`);
    }
    if (!content.startsWith("---")) {
        throw new Error(`${name}: SKILL.md must start with YAML frontmatter (---)`);
    }
    const end = content.indexOf("---", 3);
    if (end === -1) {
        throw new Error(`${name}: unclosed YAML frontmatter`);
    }
    const frontmatter = content.slice(3, end);
    if (!/^name:\s*.+/m.test(frontmatter)) {
        throw new Error(`${name}: frontmatter missing 'name:'`);
    }
    if (!/^description:\s*.+/ms.test(frontmatter)) {
        throw new Error(`${name}: frontmatter missing 'description:'`);
    }
}

async function syncTarget(targetDir, skillName, sourceDir) {
    await mkdir(targetDir, { recursive: true });
    const linkPath = join(targetDir, skillName);
    const relativeTarget = relative(join(linkPath, ".."), sourceDir);

    try {
        await rm(linkPath, { recursive: true, force: true });
    } catch {
        /* ignore */
    }

    await symlink(relativeTarget, linkPath, "dir");
}

async function main() {
    const entries = await readdir(SOURCE, { withFileTypes: true });
    const skills = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    if (skills.length === 0) {
        console.error("No skills found in .agents/skills/");
        process.exit(1);
    }

    for (const name of skills) {
        const sourceDir = join(SOURCE, name);
        await validateSkill(sourceDir, name);
    }

    for (const targetRoot of TARGETS) {
        await mkdir(targetRoot, { recursive: true });
        const existing = await readdir(targetRoot, { withFileTypes: true });
        for (const entry of existing) {
            const full = join(targetRoot, entry.name);
            if (skills.includes(entry.name)) continue;
            if (await isSymlink(full)) {
                await rm(full, { recursive: true, force: true });
                console.log(`Removed stale symlink: ${relative(ROOT, full)}`);
            }
        }
    }

    for (const name of skills) {
        const sourceDir = join(SOURCE, name);
        for (const targetRoot of TARGETS) {
            await syncTarget(targetRoot, name, sourceDir);
            console.log(`✓ ${name} → ${relative(ROOT, join(targetRoot, name))}`);
        }
    }

    console.log(`\nSynced ${skills.length} skills to ${TARGETS.length} IDE folders.`);
    console.log("Source of truth: .agents/skills/");
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
