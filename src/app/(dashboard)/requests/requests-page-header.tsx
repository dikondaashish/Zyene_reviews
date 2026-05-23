import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SendRequestDialog } from "./send-request-dialog";

export function RequestsPageHeader({
    businessId,
    businessSlug,
    businessName,
    initialCustomer,
}: {
    businessId: string;
    businessSlug?: string;
    businessName?: string;
    initialCustomer?: { name: string; phone: string; email: string };
}) {
    return (
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Review Requests</h1>
                <p className="mt-1 text-sm text-muted-foreground lg:text-base">
                    Manage and track your review invitations.
                </p>
            </div>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:shrink-0">
                <Button variant="outline" className="min-w-0 flex-1 sm:flex-initial" asChild>
                    <a href={`/api/requests/export`} className="inline-flex items-center justify-center gap-2">
                        <Download className="h-4 w-4 shrink-0" />
                        <span className="md:hidden">Export</span>
                        <span className="hidden md:inline">Export CSV</span>
                    </a>
                </Button>
                <div className="min-w-0 flex-1 max-lg:[&_button]:w-full sm:flex-initial lg:[&_button]:w-auto">
                    <SendRequestDialog
                        businessId={businessId}
                        businessSlug={businessSlug}
                        businessName={businessName}
                        initialCustomer={initialCustomer}
                        autoOpen={!!initialCustomer}
                    />
                </div>
            </div>
        </div>
    );
}
