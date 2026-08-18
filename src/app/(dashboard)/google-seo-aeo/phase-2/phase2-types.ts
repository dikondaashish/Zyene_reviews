export type Phase2VisibilityData = {
    variance: { label: string; attempts: number; rate: number | null; low: number; high: number }[];
    clusters: { name: string; observations: number; visibility: number | null; sov: number | null }[];
    sourceGaps: { domain: string; competitorCitations: number }[];
    citationChanges: { url: string; type: string; engine: string; at: string }[];
    mentions: { brand: string; sentiment: string | null; rationale: string | null; prominence: number | null; attributes: unknown }[];
};

export type Phase2OperationsData = {
    pageGaps: { url: string; prompt: string; score: number }[];
    diagnostics: { url: string; jsDelta: number | null; lcp: number | null; cls: number | null; inp: number | null; indexStatus: string | null }[];
    crawlerHits: { crawler: string; count: number; latest: string }[];
    reviewMatches: { answerExcerpt: string; reviewExcerpt: string; confidence: number; at: string }[];
    recommendations: { id: string; type: string; title: string; status: string; targetUrl: string | null; impact: unknown }[];
    reports: { id: string; period: string; status: string; createdAt: string }[];
    schedules: { id: string; cadence: string; recipients: string[]; nextSendAt: string; enabled: boolean }[];
    apiKeys: { id: string; name: string; prefix: string; scopes: string[]; lastUsedAt: string | null; revokedAt: string | null }[];
    channels: { id: string; name: string; type: string; enabled: boolean; deliveryStatus: string | null }[];
    logSources: { id: string; name: string; source: string; prefix: string; lastReceivedAt: string | null }[];
    orgRollup: { id: string; name: string; samples: number; visibility: number | null }[];
};
