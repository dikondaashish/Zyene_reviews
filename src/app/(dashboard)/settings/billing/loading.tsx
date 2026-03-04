import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BillingLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-24" />
                    <div className="space-y-4 pt-2">
                        <Skeleton className="h-4 w-32" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Plan Picker */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-7 w-36" />
                    <Skeleton className="h-10 w-56 rounded-lg" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="flex flex-col">
                            <CardHeader className="space-y-3">
                                <Skeleton className="h-6 w-28" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-9 w-24" />
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                {[1, 2, 3, 4, 5, 6].map((j) => (
                                    <div key={j} className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </CardContent>
                            <div className="p-6 pt-0">
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
