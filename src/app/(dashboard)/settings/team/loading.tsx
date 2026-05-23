import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TeamSettingsLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
            </div>
            <Separator />
            <div className="rounded-lg border border-border bg-card">
                <div className="p-4 space-y-3 border-b border-border">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
                        <Skeleton className="rounded-full shrink-0 size-10" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}
