import { BusinessInfoForm } from "@/components/settings/business-info-form";

type Business = Parameters<typeof BusinessInfoForm>[0]["business"];

export function BusinessInformationDetailsSection({ business }: { business: Business }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Business Details</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Core information about your business location and contact.
                </p>
            </div>
            <div className="px-6 py-5">
                <BusinessInfoForm key={business.id} business={business} />
            </div>
        </div>
    );
}
