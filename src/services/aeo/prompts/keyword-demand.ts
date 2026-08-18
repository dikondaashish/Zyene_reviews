type KeywordInfo = { search_volume?: number; monthly_searches?: unknown[] };
type History = { year?: number; month?: number; keyword_info?: KeywordInfo };
type Item = { keyword?: string; keyword_info?: KeywordInfo; history?: History[] };
export type KeywordDemandEnvelope = { cost?: number; tasks?: { status_code?: number; cost?: number; result?: { items?: Item[] }[] }[] };

export function parseKeywordDemandResponse(payload: KeywordDemandEnvelope, capturedAt: string) {
    const task = payload.tasks?.[0];
    if (task?.status_code !== 20000) return [];
    const costMicroUsd = Math.round((task.cost ?? payload.cost ?? 0) * 1_000_000);
    return (task.result?.[0]?.items ?? []).flatMap((item) => {
        const keyword = item.keyword?.trim();
        const latest = [...(item.history ?? [])].sort((left, right) =>
            (right.year ?? 0) * 12 + (right.month ?? 0) - ((left.year ?? 0) * 12 + (left.month ?? 0))
        )[0];
        const volume = latest?.keyword_info?.search_volume ?? item.keyword_info?.search_volume;
        if (!keyword || volume === undefined || !Number.isFinite(volume)) return [];
        const sourceMonth = latest?.year && latest.month
            ? `${latest.year}-${String(latest.month).padStart(2, "0")}-01`
            : null;
        return [{ keyword, monthlyVolume: volume, provider: "dataforseo" as const,
            isEstimated: true as const, capturedAt, costMicroUsd, ...(sourceMonth ? { sourceMonth } : {}) }];
    });
}
