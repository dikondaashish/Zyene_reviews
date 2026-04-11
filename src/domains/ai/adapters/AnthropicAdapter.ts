import AnthropicVertex from '@anthropic-ai/vertex-sdk';
import { ensureVertexAdcFromEnv } from '@/lib/google/ensure-vertex-adc-from-env';

// ─────────────────────────────────────────────────────────
// Claude via Google Cloud Vertex AI
// ─────────────────────────────────────────────────────────
//
// Billing flows through your Google Cloud project instead of
// a direct Anthropic API key.
//
// Required env vars:
//   GCP_PROJECT_ID         – GCP project ID (e.g. "zyene-reviews")
//   GCP_REGION             – Vertex AI region (e.g. "us-central1")
//
// Authentication (pick one):
//   Option A (local dev): Set GOOGLE_APPLICATION_CREDENTIALS to
//     the path of your service-account JSON key file.
//   Option B (Vercel/serverless): Set GOOGLE_VERTEX_CREDENTIALS
//     to the entire service-account JSON string (base64 or raw).
// ─────────────────────────────────────────────────────────

ensureVertexAdcFromEnv();

const region = process.env.GCP_REGION || 'us-central1';

export const anthropic = new AnthropicVertex({
    projectId: process.env.GCP_PROJECT_ID || 'zyene-reviews',
    // Claude on Vertex does not currently support the 'global' region.
    // We fallback to a stable region if 'global' is specified project-wide.
    region: region === 'global' ? 'us-east5' : region,
});
