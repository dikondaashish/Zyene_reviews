import { DashboardSkeleton as Skeleton } from "@/components/dashboard/dashboard-skeleton";

export function CustomerPortalLoading() {
    return (
        <div role="status" data-original-dashboard-colors className="h-full min-h-[420px] min-w-0 rounded-2xl border border-border bg-card p-6">
            <span className="sr-only">Loading your customer portal…</span>
            <div aria-hidden="true" className="space-y-6">
                <Skeleton className="h-3 w-40" />
                <div className="space-y-3"><Skeleton className="h-7 w-full" /><Skeleton className="h-7 w-3/4" /><Skeleton className="h-4 w-4/5" /></div>
                <div className="flex flex-wrap items-center justify-center gap-5 py-3"><Skeleton className="size-32 shrink-0 rounded-xl" /><div className="space-y-3"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-32" /><Skeleton className="h-9 w-24" /></div></div>
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex gap-3"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /></div>
            </div>
        </div>
    );
}
