import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerDetailLoading() {
    return (
        <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-4 animate-in fade-in duration-300 sm:px-5 sm:py-6 lg:px-6">
            <header className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-8 w-64 max-w-full rounded-md" />
                </div>
                <Skeleton className="h-4 w-full max-w-md rounded-md" />
                <Skeleton className="h-10 w-48 rounded-lg" />
            </header>

            <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                <CardContent className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
                        <div className="min-w-0 flex-1 space-y-4">
                            <Skeleton className="h-8 w-48 rounded-md" />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Skeleton className="h-20 rounded-xl" />
                                <Skeleton className="h-20 rounded-xl" />
                            </div>
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                    <CardContent className="grid gap-0 p-0 sm:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="border-b border-border/80 p-5 sm:border-b-0 sm:border-r sm:last:border-r-0">
                                <Skeleton className="h-3 w-24 rounded-md" />
                                <Skeleton className="mt-3 h-9 w-12 rounded-md" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <Skeleton className="h-6 w-28 rounded-md" />
                <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                    <CardContent className="space-y-0 p-0">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 border-b border-border/80 p-5 last:border-0 sm:px-8">
                                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-4 w-48 rounded-md" />
                                    <Skeleton className="h-3 w-40 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
