import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, MessageSquare, Star } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Top Stats Cards Skeletons */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[MessageSquare, Star, BarChart3, Clock].map((Icon, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Icon className="h-4 w-4 text-muted-foreground/30" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Extended Stats Row Skeletons */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-2 w-full mt-2" />
                            <Skeleton className="h-3 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row Skeletons */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i} className="min-h-[300px]">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px] w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Row Skeletons */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                {[1, 2].map((card) => (
                    <Card key={card}>
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((row) => (
                                <div key={row} className="flex flex-col gap-2 border-b last:border-0 pb-4 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-4/5" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
