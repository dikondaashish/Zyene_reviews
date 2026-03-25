
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export function PlatformTable({ data }: { data: PlatformData[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Reviews</TableHead>
                        <TableHead className="text-right">Avg Rating</TableHead>
                        <TableHead className="text-right">Response Rate</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">Profile views</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">Calls</TableHead>
                        <TableHead className="text-right hidden xl:table-cell">Directions</TableHead>
                        <TableHead className="text-right hidden xl:table-cell">Site clicks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                No data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={row.platform}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    {(row.platform.toLowerCase() === "google") && (
                                        <span className="text-blue-500">G</span> // Placeholder icon
                                    )}
                                    {row.platform}
                                </TableCell>
                                <TableCell className="text-right">{row.reviews}</TableCell>
                                <TableCell className="text-right">{row.avgRating.toFixed(1)} ★</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={row.responseRate >= 90 ? "default" : row.responseRate >= 50 ? "secondary" : "destructive"}>
                                        {row.responseRate.toFixed(0)}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell text-muted-foreground">
                                    {row.profileViews !== undefined ? row.profileViews.toLocaleString() : "—"}
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell text-muted-foreground">
                                    {row.callClicks !== undefined ? row.callClicks.toLocaleString() : "—"}
                                </TableCell>
                                <TableCell className="text-right hidden xl:table-cell text-muted-foreground">
                                    {row.directionRequests !== undefined ? row.directionRequests.toLocaleString() : "—"}
                                </TableCell>
                                <TableCell className="text-right hidden xl:table-cell text-muted-foreground">
                                    {row.websiteClicks !== undefined ? row.websiteClicks.toLocaleString() : "—"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
