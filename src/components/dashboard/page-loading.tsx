import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading({ label, variant = "list", showHeader = true }: {
    label: string; variant?: "list" | "overview"; showHeader?: boolean;
}) {
    return (
        <div role="status" aria-live="polite" className="w-full min-w-0">
            <span className="sr-only">Loading {label}…</span>
            <div aria-hidden="true" className="space-y-6">
                {showHeader && <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2"><Skeleton className="h-7 w-40 max-w-full" /><Skeleton className="h-4 w-64 max-w-full" /></div>
                    <Skeleton className="h-10 w-full sm:w-36" />
                </div>}
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map(item => <div key={item} className="min-w-0 space-y-3 rounded-xl border bg-card p-5">
                        <Skeleton className="h-4 w-24 max-w-full" /><Skeleton className="h-8 w-20 max-w-full" /><Skeleton className="h-3 w-36 max-w-full" />
                    </div>)}
                </div>
                {variant === "overview" ? <div className="grid gap-4 lg:grid-cols-2">
                    {[1, 2].map(item => <div key={item} className="min-w-0 space-y-4 rounded-xl border bg-card p-5">
                        <Skeleton className="h-5 w-40 max-w-full" /><Skeleton className="h-52 w-full" />
                    </div>)}
                </div> : <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row"><Skeleton className="h-10 w-full sm:w-72" /><Skeleton className="h-10 w-full sm:ml-auto sm:w-36" /></div>
                    {[1, 2, 3, 4, 5].map(item => <div key={item} className="flex min-w-0 items-center gap-3 border-b p-4 last:border-0">
                        <Skeleton className="size-9 shrink-0 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-40 max-w-full" /><Skeleton className="h-3 w-64 max-w-full" /></div>
                        <Skeleton className="hidden h-6 w-20 shrink-0 sm:block" />
                    </div>)}
                </div>}
            </div>
        </div>
    );
}
