import { DashboardSkeleton as Skeleton } from "@/components/dashboard/dashboard-skeleton";

export function PageFormLoading({ label }: { label: string }) {
    return (
        <div role="status" className="min-w-0 space-y-6">
            <span className="sr-only">Loading {label}…</span>
            <div aria-hidden="true" className="space-y-3">
                <Skeleton className="h-8 w-52" /><Skeleton className="h-4 w-80" />
            </div>
            <div aria-hidden="true" className="max-w-3xl space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-64" /></div>
                <div className="grid gap-6 sm:grid-cols-2">
                    {[1, 2, 3, 4].map(field => <div key={field} className="min-w-0 space-y-2">
                        <Skeleton className="h-3 w-24" /><Skeleton className="h-11 w-full rounded-lg" />
                    </div>)}
                </div>
                <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-28 w-full rounded-lg" /></div>
                <div className="flex justify-end border-t border-border pt-5"><Skeleton className="h-10 w-32 rounded-lg" /></div>
            </div>
        </div>
    );
}
