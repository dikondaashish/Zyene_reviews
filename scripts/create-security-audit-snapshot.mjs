import { execFileSync } from "node:child_process";
import { copyFileSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Never mount the working tree or its credentials into a third-party scanner.
export function createSecurityAuditSnapshot(repo, destination) {
    const root = resolve(repo);
    const target = resolve(destination);
    const offset = relative(root, target);
    if (offset !== ".." && !offset.startsWith(`..${sep}`) && !isAbsolute(offset))
        throw new Error("Snapshot must be outside the repository");
    const paths = execFileSync("git", ["ls-files", "-z", "--cached", "--others",
        "--exclude-standard", "--deduplicate"], { cwd: root }).toString().split("\0").filter(Boolean);
    let copied = 0;
    let redacted = 0;
    for (const path of paths) {
        const parts = path.split("/");
        if (isAbsolute(path) || parts.includes("..") || parts.some((p) =>
            p === ".git" || p === ".vercel" || p === ".strix" || p.startsWith(".env") ||
            /^(?:credentials|service[-_]account|private[-_]key)(?:[-_.].*)?$/i.test(p)) ||
            /\.(?:pem|key|p12|pfx)$/i.test(path)) continue;
        let safe = true;
        for (let depth = 1; depth <= parts.length; depth++) {
            try {
                const stat = lstatSync(resolve(root, ...parts.slice(0, depth)));
                if (stat.isSymbolicLink() || (depth === parts.length && !stat.isFile())) safe = false;
            } catch { safe = false; }
            if (!safe) break;
        }
        if (!safe) continue; // Deleted tracked files and symlinks are not source inputs.
        const source = resolve(root, path);
        const output = resolve(target, path);
        mkdirSync(dirname(output), { recursive: true, mode: 0o700 });
        if (/2026040516(?:4000_oauth_encryption_consolidated|4500_vault_setup)\.sql$/.test(path)) {
            // Preserve the historical hardcoded-key flow, but not its retired literal.
            const sql = readFileSync(source, "utf8").replace(/'([A-Za-z0-9_+/=-]{32,})'/g, () => {
                redacted++;
                return "'RETIRED_KEY_REDACTED_FOR_SOURCE_AUDIT'";
            });
            writeFileSync(output, sql, { mode: 0o600 });
        } else {
            copyFileSync(source, output);
        }
        copied++;
    }
    const mcpConfig = resolve(target, "security-audit-mcp-disabled.json");
    writeFileSync(mcpConfig, JSON.stringify({ mcpServers: {} }), { mode: 0o600 });
    return { copied, redacted, mcpConfig };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const [, , repo, destination] = process.argv;
    if (!repo || !destination) throw new Error("Provide repository and snapshot paths");
    console.log(JSON.stringify(createSecurityAuditSnapshot(repo, destination)));
}
