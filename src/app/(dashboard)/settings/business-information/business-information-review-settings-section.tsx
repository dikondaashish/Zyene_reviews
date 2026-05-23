import { ReviewSettingsForm } from "@/components/settings/review-settings-form";

type Business = Parameters<typeof ReviewSettingsForm>[0]["business"];

export function BusinessInformationReviewSettingsSection({ business }: { business: Business }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Review Request Settings</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Customize how review requests are sent to your customers.
                </p>
            </div>
            <div className="px-6 py-5">
                <ReviewSettingsForm key={business.id} business={business} />
            </div>
        </div>
    );
}
