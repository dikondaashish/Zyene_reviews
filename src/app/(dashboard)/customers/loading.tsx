import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CustomersLoading() {
    return (
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-4 animate-in fade-in duration-500 sm:px-5 sm:py-6 lg:px-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-60" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12 mb-1" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <div className="p-0">
                    <div className="border-b p-4 flex items-center justify-between">
                        <Skeleton className="h-9 w-64" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                    <div className="p-0">
                        <div className="grid grid-cols-5 p-4 border-b bg-muted/30">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-4 w-24" />
                            ))}
                        </div>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="grid grid-cols-5 p-4 border-b last:border-0 items-center">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-2 justify-end">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}
