export type AeoReportModel = {
    brandName: string;
    businessName: string;
    periodStart: string;
    periodEnd: string;
    visibilityPercent: number | null;
    successfulSamples: number;
    totalSamples: number;
    citations: number;
    ownCitations: number;
    competitorMentions: number;
    technicalFindings: number;
    topPrompts: { prompt: string; named: number; samples: number }[];
};

export function percent(value: number | null): string {
    return value === null ? "No measured data" : `${Math.round(value)}%`;
}
