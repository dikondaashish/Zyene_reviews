import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewRequestsPageHeader({ totalSent }: { totalSent: number }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                    Review Requests
                    <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                        {totalSent || 0}
                    </span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Track all review requests sent to your customers.
                </p>
            </div>
            <Button asChild className="w-full shrink-0 sm:w-auto">
                <Link href="/campaigns" className="flex w-full items-center justify-center">
                    <Send className="mr-2 size-4" />
                    Create Campaign
                </Link>
            </Button>
        </div>
    );
}
