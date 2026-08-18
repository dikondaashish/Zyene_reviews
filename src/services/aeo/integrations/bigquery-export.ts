export type ExportSample = { sampleId: string; businessId: string; promptId: string | null; engineId: string; status: string; sampledAt: string; costMicroUsd: number; brandNamed: boolean };

export function buildBigQueryRows(samples: readonly ExportSample[]) {
    return samples.map((sample) => ({
        insertId: `sample:${sample.sampleId}`,
        json: {
            sample_id: sample.sampleId,
            business_id: sample.businessId,
            prompt_id: sample.promptId,
            engine_id: sample.engineId,
            status: sample.status,
            sampled_at: sample.sampledAt,
            cost_micro_usd: sample.costMicroUsd,
            brand_named: sample.brandNamed,
        },
    }));
}
