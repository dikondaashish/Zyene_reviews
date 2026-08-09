import type { AuditItem } from "./google-seo-aeo-audit-utils";
import type { AeoVisibilityContent } from "./aeo-visibility-section";
import type { SearchConsoleSectionContent } from "./load-search-console-section";
import type { ShareOfVoiceResult } from "@/services/aeo/reporting/share-of-voice";
import type { GbpCompletenessResult } from "@/services/aeo/technical-audit/gbp-completeness";

export type GoogleSeoAeoContentProps = {
    businessId: string;
    businessName: string;
    businessAddress: string;
    score: number;
    measuredCount: number;
    googleAvgLive: number;
    googleCountLive: number;
    audits: AuditItem[];
    listingDescription: string;
    topKeywordList: string[];
    competitors: Array<{
        id: string;
        name: string;
        average_rating: number | null;
        total_reviews: number | null;
        google_url: string | null;
    }>;
    latestAiRun: { id: string; query: string; status: string; created_at: string } | null;
    aiResults: Array<{ model: string; found: boolean; position: number | null; snippet: string | null }>;
    latestHeatmapRun: { id: string; keyword: string; status: string; created_at: string } | null;
    heatmapCells: Array<{ cell_label: string; rank_position: number | null; visibility_score: number }>;
    /** Null when this business has never been sampled — not the same as 0%. */
    aeoVisibility: AeoVisibilityContent | null;
    /** Null when Search Console was never granted — see load-search-console-section.ts. */
    searchConsole: SearchConsoleSectionContent | null;
    /** Null when this business has never been sampled — see load-share-of-voice.ts. */
    shareOfVoice: ShareOfVoiceResult | null;
    /** F5.10 — see gbp-completeness.ts. */
    gbpCompleteness: GbpCompletenessResult;
};
