import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
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
        <PageHeader
            title="Review Requests"
            description="Manage and track your review invitations."
            actionsClassName="w-full sm:w-auto"
            actions={<>
                <Button variant="outline" className="min-w-0 flex-1 sm:flex-initial" asChild>
                    <a href={`/api/requests/export`} className="inline-flex items-center justify-center gap-2">
                        <Download className="shrink-0 size-4" />
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
            </>}
        />
    );
}
