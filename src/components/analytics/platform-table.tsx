
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={row.platform}>
                                <TableCell className="font-medium capitalize flex items-center gap-2">
                                    {row.platform === "google" && (
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
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
