import { DashboardSkeleton as Skeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
    return (
        <div role="status" className="space-y-7">
            <span className="sr-only">Loading businesses…</span>
            <div aria-hidden="true" className="space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-48" /><Skeleton className="h-4 w-96" /></div>
            <div aria-hidden="true" className="space-y-4">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
                    <div className="border-b p-4"><Skeleton className="h-4 w-36" /></div>
                    {[0, 1].map(row => <div key={row} className="flex gap-4 border-b p-6 last:border-0"><Skeleton className="size-12 shrink-0 rounded-xl" /><div className="min-w-0 flex-1 space-y-3"><Skeleton className="h-5 w-52" /><Skeleton className="h-3 w-32" /><Skeleton className="h-8 w-full" /></div></div>)}
                </div>
                <Skeleton className="h-20 rounded-xl" />
            </div>
        </div>
    );
}
