import { DashboardSkeleton as Skeleton } from "@/components/dashboard/dashboard-skeleton";
import { cn } from "@/lib/utils";

export function PanelLoading({ label = "chart", className }: { label?: string; className?: string }) {
    return (
        <div role="status" className={cn("flex h-[250px] min-w-0 flex-col gap-4 p-4", className)}>
            <span className="sr-only">Loading {label}…</span>
            <div aria-hidden="true" className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="min-h-12 w-full flex-1 rounded-lg" />
            <div aria-hidden="true" className="flex justify-between gap-4">
                {[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-3 w-12" />)}
            </div>
        </div>
    );
}
