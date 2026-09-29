import { DashboardSkeleton as Skeleton } from "@/components/dashboard/dashboard-skeleton";
import { PanelLoading } from "@/components/dashboard/panel-loading";

export default function Loading() {
    return (
        <div role="status" className="space-y-8 p-4 md:p-8">
            <span className="sr-only">Loading Google SEO and AI visibility…</span>
            <div aria-hidden="true" className="space-y-8">
                <Skeleton className="h-11 max-w-3xl rounded-lg" />
                <div className="space-y-3 border-b border-border pb-5"><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-72" /><Skeleton className="h-4 w-96" /></div>
                <PanelLoading className="h-44 rounded-xl border border-border bg-card" />
                <PanelLoading className="h-[34rem] rounded-xl border border-border bg-card" />
                <PanelLoading className="h-80 rounded-xl border border-border bg-card" />
            </div>
        </div>
    );
}
