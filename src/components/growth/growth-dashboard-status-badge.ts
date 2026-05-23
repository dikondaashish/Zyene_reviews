import type { KpiStatus } from "@/lib/growth/kpi-metrics";
import type { MatrixTaskStatus } from "@/lib/growth/implementation-matrix";

export function growthDashboardStatusBadgeClass(status: KpiStatus | MatrixTaskStatus) {
    const map: Record<string, string> = {
        above: "bg-chart-2/15 text-chart-2",
        on_track: "bg-chart-4/15 text-chart-4",
        below: "bg-destructive/15 text-destructive",
        unknown: "bg-muted text-muted-foreground",
        external: "bg-chart-1/15 text-chart-1",
        complete: "bg-chart-2/15 text-chart-2",
        ongoing: "bg-chart-4/15 text-chart-4",
        deferred: "bg-muted text-muted-foreground",
    };
    return map[status] ?? map.unknown;
}
