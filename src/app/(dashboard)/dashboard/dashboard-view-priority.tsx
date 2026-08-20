import { DashboardViewNeedsAttention } from "./dashboard-view-needs-attention";
import { DashboardViewStatCards } from "./dashboard-view-stat-cards";
import type { DashboardViewProps } from "./types";

export function DashboardViewPriority(props: DashboardViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <DashboardViewStatCards {...props} />
            <DashboardViewNeedsAttention {...props} />
        </div>
    );
}
