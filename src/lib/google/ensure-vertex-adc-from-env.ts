import fs from "fs";
import os from "os";
import path from "path";

let applied = false;

/**
 * Writes GOOGLE_VERTEX_CREDENTIALS (raw or base64 JSON) to a temp file and sets
 * GOOGLE_APPLICATION_CREDENTIALS so @google-cloud/* clients use ADC like local key files.
 * Idempotent; safe to call from multiple adapters.
 */
export function ensureVertexAdcFromEnv(): void {
    if (applied) return;
    applied = true;

    const credJson =
        process.env.GOOGLE_VERTEX_CREDENTIALS ||
        (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trimStart().startsWith("{")
            ? process.env.GOOGLE_APPLICATION_CREDENTIALS
            : null);

    if (!credJson) return;

    try {
        let creds = credJson;
        if (!creds.trimStart().startsWith("{")) {
            creds = Buffer.from(creds, "base64").toString("utf-8");
        }

        const tmpPath = path.join(os.tmpdir(), "gcloud-vertex-creds.json");
        fs.writeFileSync(tmpPath, creds);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    } catch (e) {
        console.error("[Vertex ADC] Failed to write credentials:", e);
    }
}
