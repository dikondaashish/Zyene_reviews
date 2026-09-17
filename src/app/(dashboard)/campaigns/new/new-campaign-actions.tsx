import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewCampaignActions({
    step,
    lastStep,
    saving,
    created,
    customerCount,
    canProceed,
    onBack,
    onNext,
    onSave,
}: {
    step: number;
    lastStep: number;
    saving: boolean;
    created: boolean;
    customerCount: number;
    canProceed: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave: (status: "draft" | "active") => void;
}) {
    let actionLabel = "Create campaign";
    if (customerCount > 0) actionLabel = `Queue for ${customerCount} customers`;
    if (created) actionLabel = "Retry queueing";
    if (saving) actionLabel = "Saving…";
    return (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" className="w-full sm:w-auto" disabled={saving || created} onClick={onBack}>
                <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                {step > 0 ? "Back" : "Cancel"}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {step === lastStep ? (
                    <>
                        <Button variant="outline" onClick={() => onSave("draft")} disabled={saving || created}>
                            {customerCount > 0 ? "Save campaign only" : "Save as draft"}
                        </Button>
                        <Button onClick={() => onSave("active")} disabled={saving || customerCount > 500}>
                            {actionLabel}
                            {!saving && <ArrowRight className="ml-2 size-4" aria-hidden="true" />}
                        </Button>
                    </>
                ) : (
                    <Button onClick={onNext} disabled={!canProceed}>
                        Next <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
}
