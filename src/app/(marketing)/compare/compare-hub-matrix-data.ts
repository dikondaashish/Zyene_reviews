import { VERIFIED_COMPETITOR_FACTS as vendors, VERIFIED_COMPARISON_ROWS } from "@/lib/comparisons/verified-competitor-facts";

export interface HubMatrixRow {
    feature: string;
    zyene: string;
    birdeye: string;
    podium: string;
    nicejob: string;
    gatherup: string;
}

const gatherupCells = [vendors.gatherup.price, vendors.gatherup.terms, vendors.gatherup.trial,
    vendors.gatherup.aiReplies, vendors.gatherup.competitorTracking, vendors.gatherup.sending];

/** Keep prices, plan scopes and allowances consistent with the pricing and pairwise pages. */
export const HUB_MATRIX_ROWS: HubMatrixRow[] = [
    { feature: "Best fit", zyene: "Local teams needing review requests, an inbox and Google reply tools",
        birdeye: vendors.birdeye.bestFor, podium: vendors.podium.bestFor,
        nicejob: vendors.nicejob.bestFor, gatherup: vendors.gatherup.bestFor },
    ...VERIFIED_COMPARISON_ROWS.map((row, index) => ({ ...row, gatherup: gatherupCells[index] })),
    { feature: "Connected review platforms", zyene: "Google, Facebook and Yelp; direct reply publishing on Google",
        birdeye: "Confirm required sites and reply actions", podium: "Confirm required sites and reply actions",
        nicejob: "Confirm required sites and reply actions", gatherup: "Confirm required sites and reply actions" },
];
