import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ReviewsLoading() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-10 w-44" />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex flex-col gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <Card className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-9 w-24 rounded-full" />
                        ))}
                    </div>
                </Card>

                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-5/6" />
                                        <Skeleton className="h-4 w-4/6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
