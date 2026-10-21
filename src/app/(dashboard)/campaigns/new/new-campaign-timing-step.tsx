import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DELAY_OPTIONS } from "./new-campaign-constants";
import { NewCampaignReminderSettings } from "./new-campaign-reminder-settings";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignTimingStepProps {
    form: CampaignForm;
    updateForm: (updates: Partial<CampaignForm>) => void;
}

export function NewCampaignTimingStep({ form, updateForm }: NewCampaignTimingStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="ui-section-title mb-1">Timing & Follow-up</h2>
                <p className="text-sm text-muted-foreground">
                    Control when messages are sent and whether to send follow-ups.
                </p>
            </div>

            <div className="space-y-3">
                <Label>Send Delay</Label>
                <p className="text-xs text-muted-foreground">
                    How long after adding contacts should the first message be sent? Changing this later only
                    affects contacts added afterwards; already-queued contacts keep their original delay.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {DELAY_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            aria-pressed={form.delay_minutes === opt.value}
                            onClick={() => updateForm({ delay_minutes: opt.value })}
                            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors
                                ${form.delay_minutes === opt.value
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border hover:border-primary/50"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            <NewCampaignReminderSettings form={form} updateForm={updateForm} />
        </div>
    );
}
