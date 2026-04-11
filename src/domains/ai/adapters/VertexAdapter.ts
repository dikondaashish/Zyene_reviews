/**
 * @deprecated Import from `@/domains/ai/adapters/DiscoveryEngineAdapter` instead.
 * Re-exports preserve existing import paths during the Vertex AI Search migration.
 */
export {
    generateContentWithFallback,
    nextResponseForDiscoveryEngineError as nextResponseForVertexAiError,
    searchWithGenerativeSummary,
    ingestJsonDocument,
    ingestReviewDocuments,
    toDiscoveryDocumentId,
    type VertexGenerationOptions,
} from "./DiscoveryEngineAdapter";
