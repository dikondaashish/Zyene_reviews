import AnthropicVertex from '@anthropic-ai/vertex-sdk';

// ─────────────────────────────────────────────────────────
// Claude via Google Cloud Vertex AI
// ─────────────────────────────────────────────────────────
//
// Billing flows through your Google Cloud project instead of
// a direct Anthropic API key.
//
// Required env vars:
//   GOOGLE_CLOUD_PROJECT   – GCP project ID (e.g. "zyene-reviews")
//   GOOGLE_CLOUD_REGION    – Vertex AI region (e.g. "us-east5")
//
// Authentication (pick one):
//   Option A (local dev): Set GOOGLE_APPLICATION_CREDENTIALS to
//     the path of your service-account JSON key file.
//   Option B (Vercel/serverless): Set GOOGLE_VERTEX_CREDENTIALS
//     to the entire service-account JSON string (base64 or raw).
// ─────────────────────────────────────────────────────────

// For Vercel: write inline credentials to a temp file so the
// Google Auth library can pick them up via ADC.
if (process.env.GOOGLE_VERTEX_CREDENTIALS && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const fs = require('fs');
    const os = require('os');
    const path = require('path');

    try {
        // Support both raw JSON and base64-encoded JSON
        let creds = process.env.GOOGLE_VERTEX_CREDENTIALS;
        if (!creds.startsWith('{')) {
            creds = Buffer.from(creds, 'base64').toString('utf-8');
        }

        const tmpPath = path.join(os.tmpdir(), 'gcloud-vertex-creds.json');
        fs.writeFileSync(tmpPath, creds);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    } catch (e) {
        console.error('[AI Client] Failed to write Vertex credentials:', e);
    }
}

export const anthropic = new AnthropicVertex({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'zyene-reviews',
    region: process.env.GOOGLE_CLOUD_REGION || 'us-east5',
});
