import { DELAY_OPTIONS } from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignReviewStepProps {
    form: CampaignForm;
}

export function NewCampaignReviewStep({ form }: NewCampaignReviewStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Review & Launch</h2>
                <p className="text-sm text-muted-foreground">
                    Review your campaign settings before launching.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Campaign Name</p>
                        <p className="font-semibold">{form.name}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Channel</p>
                        <p className="font-semibold capitalize">{form.channel === "both" ? "SMS + Email" : form.channel.toUpperCase()}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Trigger</p>
                        <p className="font-semibold capitalize">{form.trigger_type.replace("_", " ")}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Send Delay</p>
                        <p className="font-semibold">
                            {DELAY_OPTIONS.find((d) => d.value === form.delay_minutes)?.label || "Immediately"}
                        </p>
                    </div>
                </div>

                {(form.channel === "sms" || form.channel === "both") && (
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-2">SMS Template</p>
                        <p className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded p-3">{form.sms_template}</p>
                    </div>
                )}

                {(form.channel === "email" || form.channel === "both") && (
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Email Subject</p>
                        <p className="text-sm font-semibold mb-2">{form.email_subject}</p>
                        <p className="text-xs text-muted-foreground mb-2">Email Body</p>
                        <div className="text-sm bg-muted/50 rounded p-3 font-mono whitespace-pre-wrap">{form.email_template}</div>
                    </div>
                )}

                {form.follow_up_enabled && (
                    <div className="rounded-lg border border-primary/20 p-4">
                        <p className="text-xs text-muted-foreground mb-1">Follow-up</p>
                        <p className="text-sm">
                            After <strong>{form.follow_up_delay_hours} hours</strong>, send:
                        </p>
                        <p className="text-sm font-mono bg-muted/50 rounded p-3 mt-2 whitespace-pre-wrap">{form.follow_up_template}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
