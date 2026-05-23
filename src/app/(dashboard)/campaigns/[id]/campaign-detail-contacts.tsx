import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { statusColors, type ReviewRequest } from "./campaign-detail-types";

interface CampaignDetailContactsProps {
    requests: ReviewRequest[];
    mounted: boolean;
}

export function CampaignDetailContacts({ requests, mounted }: CampaignDetailContactsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Contacts ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {requests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No contacts sent yet. Click &ldquo;Add Contacts&rdquo; to get started.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Channel</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">
                                        {req.customer_name || "—"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {req.customer_phone || req.customer_email || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {req.channel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs ${statusColors[req.status] || ""}`}>
                                            {req.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {req.sent_at && mounted
                                            ? new Date(req.sent_at).toLocaleString()
                                            : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
