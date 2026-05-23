#!/usr/bin/env node
/**
 * Creates or updates the cron-job.org job for GET /api/cron/daily-digest
 * (Better Stack heartbeat for "Weekly Digest Emails" monitor).
 *
 * Requires in .env.local:
 *   CRON_JOB_ORG_API_KEY — from https://console.cron-job.org → Settings
 *   CRON_SECRET — same Bearer token as Vercel production
 *
 * Usage: pnpm run cron:daily-digest
 */

import { config } from "dotenv";
import { resolve } from "node:path";
import { cronAppBase } from "./cron-app-base.mjs";

config({ path: resolve(process.cwd(), ".env.local") });

const API = "https://api.cron-job.org";
const appBase = cronAppBase();
const JOB_URL = `${appBase}/api/cron/daily-digest`;
const JOB_TITLE = "Zyene — Daily digest heartbeat";
const TIMEZONE = process.env.CRON_JOB_TIMEZONE?.trim() || "America/Chicago";

const apiKey = process.env.CRON_JOB_ORG_API_KEY?.trim();
const cronSecret = process.env.CRON_SECRET?.trim();

if (!apiKey) {
    console.error(
        "Missing CRON_JOB_ORG_API_KEY. Generate one at https://console.cron-job.org/settings and add it to .env.local"
    );
    process.exit(1);
}
if (!cronSecret) {
    console.error("Missing CRON_SECRET (must match Vercel production).");
    process.exit(1);
}

const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
};

/** Every day at 08:00 in CRON_JOB_TIMEZONE */
const schedule = {
    timezone: TIMEZONE,
    expiresAt: 0,
    hours: [8],
    minutes: [0],
    mdays: [-1],
    months: [-1],
    wdays: [-1],
};

const jobPayload = {
    job: {
        url: JOB_URL,
        enabled: true,
        title: JOB_TITLE,
        saveResponses: true,
        requestMethod: 0,
        schedule,
        extendedData: {
            headers: {
                Authorization: `Bearer ${cronSecret}`,
            },
        },
    },
};

async function api(path, init = {}) {
    const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...init.headers } });
    const text = await res.text();
    let body;
    try {
        body = text ? JSON.parse(text) : {};
    } catch {
        body = { raw: text };
    }
    if (!res.ok) {
        throw new Error(`${init.method || "GET"} ${path} → ${res.status}: ${JSON.stringify(body)}`);
    }
    return body;
}

async function main() {
    const { jobs } = await api("/jobs");
    const existing = (jobs || []).find((j) => j.url === JOB_URL || j.title === JOB_TITLE);

    if (existing?.jobId) {
        await api(`/jobs/${existing.jobId}`, { method: "PATCH", body: JSON.stringify(jobPayload) });
        console.log(`Updated cron-job.org job #${existing.jobId} (${JOB_TITLE})`);
    } else {
        const { jobId } = await api("/jobs", { method: "PUT", body: JSON.stringify(jobPayload) });
        console.log(`Created cron-job.org job #${jobId} (${JOB_TITLE})`);
    }

    console.log(`  URL: ${JOB_URL}`);
    console.log(`  Schedule: daily at 08:00 (${TIMEZONE})`);
    console.log(`  Better Stack: set "Weekly Digest Emails" heartbeat to expected every 1 day.`);

    const listed = await api("/jobs");
    const job = (listed.jobs || []).find((j) => j.url === JOB_URL);
    if (job) {
        console.log(`  Enabled: ${job.enabled}`);
        console.log(`  Next execution (unix): ${job.nextExecution ?? "n/a"}`);
    }
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
