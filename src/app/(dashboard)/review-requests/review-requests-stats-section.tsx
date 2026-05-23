import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Eye, MousePointer2, CheckCircle2 } from "lucide-react";

export function ReviewRequestsStatsSection({
    totalSent,
    totalOpened,
    totalClicked,
    totalConverted,
}: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
}) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSent}</div>
                    <p className="text-xs text-muted-foreground mt-1">Review requests sent</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Opened</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOpened}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {totalSent > 0
                            ? `${Math.round((totalOpened / totalSent) * 100)}% open rate`
                            : "0% open rate"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clicked</CardTitle>
                    <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalClicked}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {totalSent > 0
                            ? `${Math.round((totalClicked / totalSent) * 100)}% click rate`
                            : "0% click rate"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Converted</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalConverted}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {totalSent > 0
                            ? `${Math.round((totalConverted / totalSent) * 100)}% conversion`
                            : "0% conversion"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
