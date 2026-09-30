import { afterEach, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const scratch: string[] = [];
afterEach(() => { for (const path of scratch.splice(0)) rmSync(path, { recursive: true, force: true }); });
function fixture() {
    const root = mkdtempSync(join(tmpdir(), "zyene-audit-test-"));
    scratch.push(root);
    const repo = join(root, "repo"), snapshot = join(root, "snapshot");
    mkdirSync(repo);
    execFileSync("git", ["init", "--quiet", repo]);
    return { repo, snapshot };
}
function run(repo: string, snapshot: string) {
    return JSON.parse(execFileSync("node", [resolve("scripts/create-security-audit-snapshot.mjs"), repo, snapshot],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })) as { copied: number; redacted: number };
}

it("copies source while excluding tracked credentials, symlinks and deleted files", () => {
    const { repo, snapshot } = fixture();
    writeFileSync(join(repo, "source.ts"), "export const safe = true;");
    writeFileSync(join(repo, ".env.local"), "PRIVATE=synthetic-only");
    writeFileSync(join(repo, "service-account.json"), "synthetic-only");
    writeFileSync(join(repo, "private.pem"), "synthetic-only");
    writeFileSync(join(repo, "deleted.ts"), "deleted");
    symlinkSync(join(repo, ".env.local"), join(repo, "link.ts"));
    execFileSync("git", ["add", "."], { cwd: repo });
    rmSync(join(repo, "deleted.ts"));
    expect(run(repo, snapshot).copied).toBe(1);
    expect(readFileSync(join(snapshot, "source.ts"), "utf8")).toContain("safe");
    for (const path of [".env.local", "service-account.json", "private.pem", "deleted.ts", "link.ts"])
        expect(existsSync(join(snapshot, path))).toBe(false);
    expect(JSON.parse(readFileSync(join(snapshot, "security-audit-mcp-disabled.json"), "utf8")))
        .toEqual({ mcpServers: {} });
});

it("redacts historical key material only in the snapshot", () => {
    const { repo, snapshot } = fixture();
    const name = "supabase/migrations/20260405164500_vault_setup.sql";
    mkdirSync(join(repo, "supabase/migrations"), { recursive: true });
    const synthetic = "synthetic-retired-key-".repeat(3);
    writeFileSync(join(repo, name), `-- Provided: ${synthetic}\nINSERT INTO vault VALUES ('primary', '${synthetic}');`);
    expect(run(repo, snapshot).redacted).toBe(2);
    expect(readFileSync(join(snapshot, name), "utf8")).not.toContain(synthetic);
    expect(readFileSync(join(repo, name), "utf8")).toContain(synthetic);
});

it("redacts bearer-like heartbeat URLs in copied source without changing the original", () => {
    const { repo, snapshot } = fixture();
    const source = "src/lib/monitoring/review-sync-heartbeat.ts";
    mkdirSync(join(repo, "src/lib/monitoring"), { recursive: true });
    const synthetic = "https://uptime.betterstack.com/api/v1/heartbeat/synthetic-monitor-token";
    writeFileSync(join(repo, source), `const url = "${synthetic}";`);
    expect(run(repo, snapshot).redacted).toBe(1);
    expect(readFileSync(join(snapshot, source), "utf8")).not.toContain(synthetic);
    expect(readFileSync(join(repo, source), "utf8")).toContain(synthetic);
});

it("rejects snapshots inside the original checkout", () => {
    const { repo } = fixture();
    expect(() => run(repo, join(repo, "scan"))).toThrow();
    expect(() => run(repo, join(repo, "..scan"))).toThrow();
});
