import assert from "node:assert/strict";
import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { MONTHLY_CHANNEL_RESERVATION_SCRIPT as script } from "../src/lib/stripe/monthly-channel-reservation-script.ts";

const run = promisify(execFile);
const name = `zyene-security-redis-${randomUUID()}`;
const cli = (...args) => execFileSync("docker", ["exec", name, "redis-cli", "--raw", ...args], { encoding: "utf8" }).trim();
const reserve = (keys, args) => cli("EVAL", script, String(keys.length), ...keys, ...args.map(String));
try {
    execFileSync("docker", ["run", "--rm", "-d", "--name", name, "--network", "none", "--memory", "128m",
        "redis:7-alpine", "redis-server", "--save", "", "--appendonly", "no"], { stdio: "ignore" });
    for (let i = 0; i < 20; i++) {
        try { if (cli("PING") === "PONG") break; } catch { /* Local startup only. */ }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal(cli("PING"), "PONG");
    assert.equal(reserve(["org-a:sms", "claim-a"], [0, 1, 3600]), "1");
    assert.equal(reserve(["org-a:sms", "claim-a"], [1, 1, 3600]), "1");
    assert.equal(cli("GET", "org-a:sms"), "1");
    assert.equal(reserve(["org-a:sms", "claim-b"], [1, 1, 3600]), "0");
    assert.equal(reserve(["org-b:sms", "claim-c"], [0, 1, 3600]), "1");
    assert.equal(reserve(["org-a:next-month:sms", "claim-d"], [0, 1, 3600]), "1");
    assert.equal(reserve(["seeded:sms", "claim-e"], [8, 10, 3600]), "1");
    assert.equal(cli("GET", "seeded:sms"), "9");
    assert.equal(reserve(["seeded:sms", "claim-e"], [9, 2, 3600]), "0");
    assert.equal(reserve(["pair:email", "pair:sms", "pair:claim"], [0, 10, 0, 0, 3600]), "0");
    assert.equal(cli("EXISTS", "pair:email", "pair:sms", "pair:claim"), "0");
    const results = await Promise.all(Array.from({ length: 20 }, (_, index) => run("docker", ["exec", name,
        "redis-cli", "--raw", "EVAL", script, "2", "race:sms", `race:claim:${index}`, "0", "3", "3600"])));
    assert.equal(results.filter(result => result.stdout.trim() === "1").length, 3);
    assert.equal(cli("GET", "race:sms"), "3");
    assert(Number(cli("TTL", "race:sms")) > 0);
    console.log("PASS: atomic channel caps, concurrent exhaustion, retry, DB floor, tenant/month isolation, downgrade and all-or-nothing reservation");
} finally {
    try { execFileSync("docker", ["rm", "-f", name], { stdio: "ignore" }); } catch { /* Already removed. */ }
}
