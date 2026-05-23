import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlatformData {
    platform: string;
    reviews: number;
    avgRating: number;
    responseRate: number;
    /** Google Business Profile Performance (optional) */
    profileViews?: number;
    callClicks?: number;
    directionRequests?: number;
    websiteClicks?: number;
}

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--brand-google)"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--google-logo-green)"/>
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="var(--google-logo-yellow)"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="var(--google-logo-red)"/>
    </svg>
);

export function PlatformTable({ data }: { data: PlatformData[] }) {
    return (
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Platform</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">Reviews</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">Avg Rating</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">Response Rate</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Profile views</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Calls</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Directions</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Site clicks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                                No platform data available for this period.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={row.platform} className="transition-colors hover:bg-muted/20">
                                <TableCell className="font-bold py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center rounded-lg border bg-background shrink-0 size-8">
                                            {(row.platform.toLowerCase() === "google") ? (
                                                <GoogleIcon />
                                            ) : (
                                                <span className="text-[10px] font-black">{row.platform[0]}</span>
                                            )}
                                        </div>
                                        <span className="truncate">{row.platform}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">{row.reviews.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-bold tabular-nums">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                                        {row.avgRating.toFixed(1)} 
                                        <span className="text-[10px]">★</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge 
                                        variant="outline"
                                        className={cn(
                                            "font-bold tabular-nums",
                                            row.responseRate >= 90
                                                ? "bg-chart-2/10 text-chart-2 border-chart-2/30 dark:bg-chart-2/20 dark:text-chart-2 dark:border-chart-2/30"
                                                : row.responseRate >= 50 
                                                    ? "bg-primary/10 text-primary border-primary/20" 
                                                    : "bg-sync-action/10 text-sync-action border-sync-action/30 dark:bg-sync-action/20 dark:text-sync-action dark:border-sync-action/30"
                                        )}
                                    >
                                        {row.responseRate.toFixed(0)}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell text-muted-foreground tabular-nums font-medium">
                                    {row.profileViews !== undefined ? row.profileViews.toLocaleString() : "-"}
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell text-muted-foreground tabular-nums font-medium">
                                    {row.callClicks !== undefined ? row.callClicks.toLocaleString() : "-"}
                                </TableCell>
                                <TableCell className="text-right hidden xl:table-cell text-muted-foreground tabular-nums font-medium">
                                    {row.directionRequests !== undefined ? row.directionRequests.toLocaleString() : "-"}
                                </TableCell>
                                <TableCell className="text-right hidden xl:table-cell text-muted-foreground tabular-nums font-medium">
                                    {row.websiteClicks !== undefined ? row.websiteClicks.toLocaleString() : "-"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
