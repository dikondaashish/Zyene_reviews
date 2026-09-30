import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runner = readFileSync("scripts/run-strix-akashml.sh", "utf8");
const preflight = runner.slice(0, runner.indexOf('\nsnapshot="'));

function resolveDockerHost(existing?: string) {
    return execFileSync("/bin/bash", ["-c", `
        git() { printf '/tmp/synthetic-repo'; }
        docker() {
            if [[ "$1" == info ]]; then return 0; fi
            if [[ "$*" == "context inspect --format {{.Endpoints.docker.Host}}" ]]; then
                printf 'unix:///tmp/synthetic-docker.sock'; return 0
            fi
            return 1
        }
        ${preflight}
        printf '%s' "$DOCKER_HOST"
    `], {
        encoding: "utf8",
        env: { NODE_ENV: "test", PATH: process.env.PATH, HOME: "/tmp", AKASHML_API_KEY: "synthetic-not-a-key",
            STRIX_BIN: "/usr/bin/true", ...(existing ? { DOCKER_HOST: existing } : {}) },
    });
}

describe("Strix Docker SDK context binding", () => {
    it("uses the same Docker endpoint as the CLI when no explicit host is configured", () => {
        expect(preflight).toContain("docker context inspect");
        expect(resolveDockerHost()).toBe("unix:///tmp/synthetic-docker.sock");
    });
    it("preserves an explicitly configured Docker host", () => {
        expect(resolveDockerHost("unix:///tmp/explicit.sock")).toBe("unix:///tmp/explicit.sock");
    });
});
