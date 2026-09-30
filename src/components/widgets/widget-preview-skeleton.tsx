import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export function WidgetPreviewSkeleton({ badge = false }: { badge?: boolean }) {
    return <div className="space-y-6 bg-card p-5 text-card-foreground sm:p-6" role="status" aria-label="Loading widget preview">
        <span className="sr-only">Loading widget preview…</span>
        {badge ? <div className="mx-auto flex max-w-64 flex-col items-center gap-4 rounded-xl border p-6"><DashboardSkeleton className="size-10 rounded-full" /><DashboardSkeleton className="h-5 w-36" /><DashboardSkeleton className="h-6 w-28" /><DashboardSkeleton className="h-3 w-32" /></div> : <>
            <DashboardSkeleton className="mx-auto h-7 w-3/5 max-w-72" />
            <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl border p-5"><div className="space-y-3"><DashboardSkeleton className="h-5 w-40" /><DashboardSkeleton className="h-4 w-32" /></div><DashboardSkeleton className="h-10 w-36 rounded-full" /></div>
            <div className="grid grid-cols-1 gap-5 min-[500px]:grid-cols-2 min-[900px]:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className={`space-y-5 rounded-xl border p-5 ${index === 1 ? "hidden min-[500px]:block" : index === 2 ? "hidden min-[900px]:block" : ""}`}><div className="flex items-center gap-3"><DashboardSkeleton className="size-10 shrink-0 rounded-full" /><div className="w-full space-y-2"><DashboardSkeleton className="h-4 w-3/4" /><DashboardSkeleton className="h-3 w-1/2" /></div></div><DashboardSkeleton className="h-4 w-24" /><div className="space-y-2"><DashboardSkeleton className="h-3 w-full" /><DashboardSkeleton className="h-3 w-full" /><DashboardSkeleton className="h-3 w-4/5" /></div></div>)}</div>
        </>}
    </div>;
}
