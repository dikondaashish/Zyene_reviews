import {
    DocumentServiceClient,
    SearchServiceClient,
    protos,
} from "@google-cloud/discoveryengine";
import { ensureVertexAdcFromEnv } from "@/lib/google/ensure-vertex-adc-from-env";

ensureVertexAdcFromEnv();

const projectId =
    process.env.GCP_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    "";

/** e.g. `global` or `us` — must match where the data store was created */
const location =
    process.env.DISCOVERY_ENGINE_LOCATION?.trim() || "global";

const collection =
    process.env.DISCOVERY_ENGINE_COLLECTION?.trim() || "default_collection";

const dataStoreId = process.env.DISCOVERY_ENGINE_DATA_STORE_ID?.trim() || "";

/** When set, search uses the Search *app* serving config (same as console Preview). Integration tab → Engine ID. */
const engineId = process.env.DISCOVERY_ENGINE_ENGINE_ID?.trim() || "";

const servingConfigId =
    process.env.DISCOVERY_ENGINE_SERVING_CONFIG?.trim() || "default_search";

/** Override auto endpoint if Google routes your API differently */
function apiEndpoint(): string | undefined {
    const explicit = process.env.DISCOVERY_ENGINE_API_ENDPOINT?.trim();
    if (explicit) return explicit;
    if (location === "global") return "discoveryengine.googleapis.com";
    return `${location}-discoveryengine.googleapis.com`;
}

let searchClient: SearchServiceClient | null = null;
let documentClient: DocumentServiceClient | null = null;

function getSearchClient(): SearchServiceClient {
    if (!searchClient) {
        const ep = apiEndpoint();
        searchClient = new SearchServiceClient(
            ep ? { apiEndpoint: ep } : undefined
        );
    }
    return searchClient;
}

function getDocumentClient(): DocumentServiceClient {
    if (!documentClient) {
        const ep = apiEndpoint();
        documentClient = new DocumentServiceClient(
            ep ? { apiEndpoint: ep } : undefined
        );
    }
    return documentClient;
}

function assertConfig(): void {
    if (!projectId) {
        throw new Error(
            "Discovery Engine: set GCP_PROJECT_ID (or GOOGLE_CLOUD_PROJECT)"
        );
    }
    if (!dataStoreId) {
        throw new Error(
            "Discovery Engine: set DISCOVERY_ENGINE_DATA_STORE_ID to your Vertex AI Search data store"
        );
    }
}

function servingConfigName(): string {
    assertConfig();
    const client = getSearchClient();
    if (engineId) {
        return client.projectLocationCollectionEngineServingConfigPath(
            projectId,
            location,
            collection,
            engineId,
            servingConfigId
        );
    }
    return client.projectLocationCollectionDataStoreServingConfigPath(
        projectId,
        location,
        collection,
        dataStoreId,
        servingConfigId
    );
}

/** Safe document id for Discovery Engine (alphanumeric, underscore, hyphen) */
export function toDiscoveryDocumentId(raw: string): string {
    const s = raw.replace(/[^a-zA-Z0-9_-]/g, "_");
    return s.slice(0, 128) || "doc";
}

export interface SearchWithSummaryOptions {
    /** Max documents used when building the generative summary */
    summaryResultCount?: number;
    includeCitations?: boolean;
}

type SummaryRecord = Record<string, unknown>;

function extractSummaryText(
    response: protos.google.cloud.discoveryengine.v1.ISearchResponse | null | undefined
): string {
    const s = response?.summary as SummaryRecord | null | undefined;
    if (!s) return "";
    const raw =
        s.summaryText ??
        s.summary_text ??
        (typeof s.text === "string" ? s.text : undefined);
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "";
}

function logEmptySummaryDiagnostic(
    response: protos.google.cloud.discoveryengine.v1.ISearchResponse | undefined
): void {
    if (!response) {
        console.warn("[DiscoveryEngine] Empty summary: no response payload");
        return;
    }
    const results = response.results ?? [];
    const summary = response.summary as SummaryRecord | undefined;
    const skipped =
        summary?.summarySkippedReasons ?? summary?.summary_skipped_reasons;
    console.warn(
        "[DiscoveryEngine] Empty summary diagnostic:",
        JSON.stringify({
            resultsReturned: results.length,
            totalSize: response.totalSize,
            semanticState: response.semanticState,
            summarySkippedReasons: skipped,
            hasSummaryObject: Boolean(summary),
        })
    );
}

/**
 * Discovery Search uses `query` for retrieval; the generative summary is grounded on matched
 * documents. Put corpus-like text (e.g. review bodies) before long instructions so hits are found.
 */
/** Match `ingestReviewDocuments` ids: review_<reviewId with dashes as underscores>. */
function documentIdHintsFromPrompt(prompt: string): string {
    const re = /"reviewId"\s*:\s*"([^"]+)"/g;
    const parts: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(prompt)) !== null) {
        parts.push(`review_${m[1].replace(/-/g, "_")}`);
    }
    return [...new Set(parts)].join(" ");
}

/** Pull review bodies from JSON embedded in prompts so lexical/semantic retrieval matches indexed `content`. */
function retrievalPrefixFromPromptJson(prompt: string): string {
    const unescape = (s: string) =>
        s
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\");

    const snippets: string[] = [];
    const re = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(prompt)) !== null && snippets.length < 16) {
        const t = unescape(m[1]).trim();
        if (t.length > 8) snippets.push(t);
    }
    if (snippets.length === 0) return "";
    const blob = snippets.join(" ").slice(0, 4000);
    return (
        `Match documents about customer reviews and feedback. Key excerpts:\n${blob}\n\n` +
        `Also match: review rating customer experience.\n\n`
    );
}

function discoveryQueryForRetrieval(prompt: string): string {
    const p = prompt.trim();
    const markers = ["Reviews to analyze:\n", "Reviews to analyze:"];
    for (const m of markers) {
        const idx = p.indexOf(m);
        if (idx > 0) {
            const before = p.slice(0, idx).trim();
            const fromMarker = p.slice(idx).trim();
            return `${fromMarker}\n\n---\nTask and output format:\n${before}`;
        }
    }
    const m = /^([\s\S]*?)(Reviews \(\d+ total\):[\s\S]+)$/i.exec(p);
    if (m && m[1] && m[2]) {
        return `${m[2].trim()}\n\n---\n${m[1].trim()}`;
    }
    return p;
}

/**
 * Runs Vertex AI Search with generative summary (grounded on the data store).
 */
export async function searchWithGenerativeSummary(
    query: string,
    options: SearchWithSummaryOptions = {}
): Promise<{ summaryText: string; rawResponse: protos.google.cloud.discoveryengine.v1.ISearchResponse }> {
    assertConfig();
    const client = getSearchClient();
    const servingConfig = servingConfigName();

    const summaryResultCount = options.summaryResultCount ?? 5;
    const includeCitations = options.includeCitations ?? true;

    const [, , response] = await client.search(
        {
            servingConfig,
            query,
            pageSize: 30,
            languageCode: "en-US",
            queryExpansionSpec: { condition: "AUTO" },
            spellCorrectionSpec: { mode: "AUTO" },
            contentSearchSpec: {
                summarySpec: {
                    summaryResultCount,
                    includeCitations,
                    ignoreAdversarialQuery: true,
                    modelSpec: { version: "stable" },
                },
            },
        },
        { autoPaginate: false }
    );

    const summaryText = extractSummaryText(response);
    if (!summaryText) {
        logEmptySummaryDiagnostic(response);
    }

    return { summaryText, rawResponse: response };
}

export type IngestJsonPayload = Record<string, unknown>;

/** Searchable body for Vertex AI Search: must live in `content`, not only inside `jsonData`. */
function searchableTextFromPayload(payload: IngestJsonPayload): string {
    const t = payload.text;
    if (typeof t === "string" && t.trim()) return t.trim();
    return JSON.stringify(payload);
}

/**
 * Metadata fields only (review text goes in `content`). `jsonData` must conform to the
 * data store schema; keeping it to non-body fields avoids huge JSON blobs that do not rank well.
 */
function metadataJsonForDocument(payload: IngestJsonPayload): string {
    const meta: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) {
        if (k === "text") continue;
        meta[k] = v;
    }
    return JSON.stringify(meta);
}

/**
 * Creates or replaces a document in the default branch.
 * Uses `content.rawBytes` + `text/plain` for what search retrieves, and `jsonData` for metadata
 * (proto oneof: do not set both `structData` and `jsonData`).
 */
export async function ingestJsonDocument(
    documentId: string,
    payload: IngestJsonPayload
): Promise<void> {
    assertConfig();
    const docClient = getDocumentClient();
    const safeId = toDiscoveryDocumentId(documentId);

    const name =
        docClient.projectLocationCollectionDataStoreBranchDocumentPath(
            projectId,
            location,
            collection,
            dataStoreId,
            "default_branch",
            safeId
        );

    const plain = searchableTextFromPayload(payload);
    const document: protos.google.cloud.discoveryengine.v1.IDocument = {
        name,
        id: safeId,
        jsonData: metadataJsonForDocument(payload),
        content: {
            rawBytes: Buffer.from(plain, "utf8"),
            mimeType: "text/plain",
        },
    };

    await docClient.updateDocument({
        document,
        allowMissing: true,
    });
}

/**
 * Batch ingest for reviews / Q&A snippets before a grounded search call.
 * Failures are logged; does not throw (so one bad row does not block analysis).
 */
export async function ingestReviewDocuments(
    items: Array<{ documentId: string; payload: IngestJsonPayload }>
): Promise<{ ok: number; failed: number }> {
    let ok = 0;
    let failed = 0;
    for (const item of items) {
        try {
            await ingestJsonDocument(item.documentId, item.payload);
            ok++;
        } catch (e) {
            failed++;
            console.warn(
                `[DiscoveryEngine] ingest failed for ${item.documentId}:`,
                e instanceof Error ? e.message : e
            );
        }
    }
    return { ok, failed };
}

// --- Drop-in compatibility with former VertexAdapter Gemini API ---

export interface VertexGenerationOptions {
    requireJson?: boolean;
    /** Ignored by Discovery Engine (no API-level JSON schema); keep for call-site compatibility */
    schema?: unknown;
    /** Maps to summaryResultCount ceiling */
    isPremium?: boolean;
    /** Web search grounding is not used; datastore grounding is always on */
    enableGrounding?: boolean;
}

/**
 * Maps the old “prompt Gemini” flow to Search + generative summary.
 * The prompt should include any structured payload (e.g. review JSON) you need the model to reason over;
 * indexed documents in the data store provide additional grounding.
 */
export async function generateContentWithFallback(
    prompt: string,
    options: VertexGenerationOptions = {}
): Promise<string> {
    const { requireJson = false, isPremium = false } = options;

    let core = discoveryQueryForRetrieval(prompt.trim());
    // Engine serving configs (console Preview) often match short queries like "review"; a long
    // retrieval blob first can yield zero hits. Prefer a short hint + prompt when using an engine.
    if (engineId) {
        const ids = documentIdHintsFromPrompt(prompt);
        const hint =
            process.env.DISCOVERY_ENGINE_RETRIEVAL_HINT?.trim() ||
            "review customer feedback ratings";
        core = `${ids ? `${ids} ` : ""}${hint}\n\n${core}`;
    } else {
        const prefix = retrievalPrefixFromPromptJson(prompt);
        if (prefix) {
            core = prefix + core;
        }
    }
    if (requireJson) {
        core += `\n\nReturn valid JSON only with no markdown code fences or commentary.`;
    }

    const summaryResultCount = isPremium ? 8 : 5;

    const { summaryText } = await searchWithGenerativeSummary(core, {
        summaryResultCount,
        // Citations can break JSON parsing; for plain-text prompts, citations may help avoid empty summaries on some configs.
        includeCitations: !requireJson,
    });

    if (!summaryText) {
        throw new Error(
            "Discovery Engine returned an empty summary. Enable generative answers on the Vertex AI Search serving config, confirm billing, wait for document indexing, and check logs for [DiscoveryEngine] Empty summary diagnostic (often resultsReturned: 0)."
        );
    }

    const stripped = stripMarkdownCodeFence(summaryText);
    const t = stripped.trim();
    if (/^no results could be found/i.test(t)) {
        throw new Error(
            "Discovery Engine returned no search hits (same as Preview with a bad query). Set DISCOVERY_ENGINE_ENGINE_ID to your Search app engine ID from the Integration tab so the API uses the app serving config as Preview does, ensure DISCOVERY_ENGINE_SERVING_CONFIG matches (often default_search), wait for indexing after ingest, and confirm review text is in the query for retrieval."
        );
    }
    if (/summary could not be generated/i.test(t)) {
        throw new Error(
            "Discovery Engine returned search results but no generative summary (query may be too long or complex for the summarizer). Try DISCOVERY_ENGINE_RETRIEVAL_HINT, shorten prompts, or use the console Answer API flow; ensure the Search app data store is linked and indexing is complete."
        );
    }

    return stripped;
}

function stripMarkdownCodeFence(text: string): string {
    const t = text.trim();
    const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
    return m ? m[1].trim() : t;
}

export function nextResponseForDiscoveryEngineError(
    error: unknown,
    genericUserMessage: string
): Response {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[DISCOVERY ENGINE ERROR]", msg);

    if (/403|IAM|permission|unauthenticated|PERMISSION_DENIED/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "Discovery Engine authentication failed. Check service account / ADC and IAM roles (Discovery Engine User).",
                code: "AI_AUTH_FAILED",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    if (/429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "Discovery Engine quota exceeded. Try again shortly.",
                code: "QUOTA_EXCEEDED",
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
        );
    }

    if (/NOT_FOUND|not found|Invalid serving config/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "Vertex AI Search serving config or data store not found. Verify DISCOVERY_ENGINE_* env vars.",
                code: "DISCOVERY_NOT_FOUND",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    if (/DISCOVERY_ENGINE_ENGINE_ID|no search hits/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "Vertex AI Search returned no matching documents for this query. Set DISCOVERY_ENGINE_ENGINE_ID from the app Integration tab, or wait for indexing after ingest.",
                code: "DISCOVERY_NO_HITS",
                details: msg,
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    if (/summary could not be generated/i.test(msg)) {
        return new Response(
            JSON.stringify({
                error: "Vertex AI Search could not build a generative summary for this query. Try a shorter prompt or adjust DISCOVERY_ENGINE_RETRIEVAL_HINT.",
                code: "DISCOVERY_SUMMARY_FAILED",
                details: msg,
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ error: genericUserMessage, details: msg }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
}
