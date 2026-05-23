import Link from "next/link";
import { Send, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReviewRequestsEmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="text-muted-foreground mb-4 size-12" />
                <h3 className="text-lg font-semibold">No review requests sent yet</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                    Start sending review requests to customers to see them tracked here.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/campaigns">
                        <Send className="mr-2 size-4" />
                        Create Your First Campaign
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
