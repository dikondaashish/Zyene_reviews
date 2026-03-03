import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6 overflow-hidden animate-in fade-in duration-500">
            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <Skeleton className="h-9 w-40" />
                <Skeleton className="h-10 w-full max-w-[400px]" />
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-28" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[250px] w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Secondary Charts */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
                <Card className="col-span-4">
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Table Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
