import { DashboardSkeleton as Skeleton } from "@/components/dashboard/dashboard-skeleton";

export function SmartInsightsCardLoading() {
    return (
        <div role="status" data-original-dashboard-colors className="h-full min-h-[420px] min-w-0 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <span className="sr-only">Loading Smart Insights. Analyzing recent reviews…</span>
            <div aria-hidden="true" className="space-y-6">
                <div className="flex items-center justify-between gap-4"><Skeleton className="h-5 w-32" /><Skeleton className="h-6 w-24 rounded-full" /></div>
                <div className="space-y-3"><Skeleton className="h-7 w-full" /><Skeleton className="h-7 w-4/5" /><Skeleton className="h-4 w-3/5" /></div>
                <div className="flex gap-3 border-b border-border pb-4"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">{[1, 2, 3, 4].map(item => <div key={item} className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-20" /></div>)}</div>
                    <div className="space-y-3 rounded-xl border border-border p-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /></div>
                </div>
            </div>
        </div>
    );
}
