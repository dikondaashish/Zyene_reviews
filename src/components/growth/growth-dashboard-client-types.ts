import type { KpiCategory } from "@/lib/growth/kpi-definitions";

export type GrowthDashboardTabId = "kpis" | "pages" | "matrix" | "audit";

export const GROWTH_DASHBOARD_CATEGORY_LABELS: Record<KpiCategory, string> = {
    acquisition: "Acquisition",
    conversion: "Conversion",
    retention: "Retention & revenue",
    plg: "Viral / PLG",
};
