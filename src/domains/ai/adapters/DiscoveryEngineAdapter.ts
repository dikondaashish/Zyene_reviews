import {
    DocumentServiceClient,
    SearchServiceClient,
    protos,
} from "@google-cloud/discoveryengine";

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
    return getSearchClient().projectLocationCollectionDataStoreServingConfigPath(
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
            pageSize: 10,
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

    const summaryText =
        (response?.summary?.summaryText &&
            String(response.summary.summaryText).trim()) ||
        "";

    return { summaryText, rawResponse: response };
}

export type IngestJsonPayload = Record<string, unknown>;

/**
 * Creates or replaces a document in the default branch using `jsonData`
 * (works with generic / unstructured-compatible stores).
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

    const document: protos.google.cloud.discoveryengine.v1.IDocument = {
        name,
        id: safeId,
        jsonData: JSON.stringify(payload),
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

    let query = prompt.trim();
    if (requireJson) {
        query += `\n\nReturn valid JSON only with no markdown code fences or commentary.`;
    }

    const summaryResultCount = isPremium ? 8 : 5;

    const { summaryText } = await searchWithGenerativeSummary(query, {
        summaryResultCount,
        includeCitations: false,
    });

    if (!summaryText) {
        throw new Error(
            "Discovery Engine returned an empty summary. Check data store, serving config, and billing."
        );
    }

    return stripMarkdownCodeFence(summaryText);
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

    return new Response(
        JSON.stringify({ error: genericUserMessage, details: msg }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
}
