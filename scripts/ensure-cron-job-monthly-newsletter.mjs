#!/usr/bin/env node
/**
 * Creates or updates the cron-job.org job for GET /api/cron/monthly-newsletter.
 *
 * Requires in .env.local (loaded automatically):
 *   CRON_JOB_ORG_API_KEY — from https://console.cron-job.org → Settings
 *   CRON_SECRET — same Bearer token as Vercel production
 *
 * Usage: node scripts/ensure-cron-job-monthly-newsletter.mjs
 */

import { config } from "dotenv";
import { resolve } from "node:path";
import { cronAppBase } from "./cron-app-base.mjs";

config({ path: resolve(process.cwd(), ".env.local") });

const API = "https://api.cron-job.org";
const JOB_URL = `${cronAppBase()}/api/cron/monthly-newsletter`;
const JOB_TITLE = "Zyene — Monthly newsletter";
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

const schedule = {
    timezone: TIMEZONE,
    expiresAt: 0,
    hours: [10],
    minutes: [0],
    mdays: [1],
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
        console.log(`  URL: ${JOB_URL}`);
        console.log(`  Schedule: day 1 of month at 10:00 (${TIMEZONE})`);
    } else {
        const { jobId } = await api("/jobs", { method: "PUT", body: JSON.stringify(jobPayload) });
        console.log(`Created cron-job.org job #${jobId} (${JOB_TITLE})`);
        console.log(`  URL: ${JOB_URL}`);
        console.log(`  Schedule: day 1 of month at 10:00 (${TIMEZONE})`);
    }

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
