import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function IntegrationsLoading() {
    return (
        <div className="flex flex-1 flex-col gap-10 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
            <div className="space-y-4">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-9 w-40 rounded-md" />
                    <Skeleton className="h-9 w-44 rounded-md" />
                </div>
            </div>

            <section className="space-y-5">
                <div className="flex items-center gap-3">
                    <Skeleton className="rounded-lg size-8" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
