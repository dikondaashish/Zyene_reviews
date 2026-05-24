#!/usr/bin/env node
/**
 * Install Vercel official agent skills from vercel-labs/agent-skills (MIT).
 * https://github.com/vercel-labs/agent-skills
 *
 * Usage: node scripts/install-vercel-agent-skills.mjs
 *   or:  pnpm run skills:vercel
 */

import { spawnSync } from "node:child_process";

const args = ["skills", "add", "vercel-labs/agent-skills", "-y", "--agent", "cursor"];

const result = spawnSync("npx", args, { stdio: "inherit", shell: false });

if (result.status !== 0) {
    process.exit(result.status ?? 1);
}

console.log("\nDone. Skills live under .agents/skills/ (see skills-lock.json).");
console.log("Restart Cursor to pick up new skills.");
