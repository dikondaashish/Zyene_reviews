import { renderCampaignPreview, type CampaignPreviewContext } from "@/lib/campaigns/preview";
import { DELAY_OPTIONS } from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignReviewStepProps {
    context: CampaignPreviewContext;
    form: CampaignForm;
    customerCount?: number;
}

export function NewCampaignReviewStep({ form, context, customerCount = 0 }: NewCampaignReviewStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Review campaign</h2>
                <p className="text-sm text-muted-foreground">
                    Preview for {context.businessName}, using a sample customer. Business timezone: {context.timezone}. Message length and delivery eligibility vary by recipient; usage counts against your plan allowances.
                </p>
            </div>

            <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-semibold">{customerCount ? `${customerCount} selected customers` : "No recipients added yet"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{customerCount ? "Queueing starts this campaign for eligible contacts. Opted-out customers and contacts without the selected channel are skipped. Saving the campaign only does not save or send to this selection." : "Create this campaign, then add contacts from its details page to start sending."}</p>
                </div>
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
                        <p className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded p-3">{renderCampaignPreview(form.sms_template, context)}</p>
                    </div>
                )}

                {(form.channel === "email" || form.channel === "both") && (
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Email Subject</p>
                        <p className="text-sm font-semibold mb-2">{renderCampaignPreview(form.email_subject, context)}</p>
                        <p className="text-xs text-muted-foreground mb-2">Email Body</p>
                        <div className="text-sm bg-muted/50 rounded p-3 font-mono whitespace-pre-wrap">{renderCampaignPreview(form.email_template, context)}</div>
                    </div>
                )}

                {form.follow_up_enabled && (
                    <div className="rounded-lg border border-primary/20 p-4">
                        <p className="text-xs text-muted-foreground mb-1">Reminder drip</p>
                        <p className="text-sm">
                            Day 0 → Day 7 → Day 14. Stops after a tracked click or completed request; publication is not verified.
                        </p>
                        <p className="text-xs text-muted-foreground mt-3 mb-1">Step 2 (Day 7)</p>
                        <p className="text-sm font-mono bg-muted/50 rounded p-3 whitespace-pre-wrap">
                            {renderCampaignPreview(form.follow_up_template, context)}
                        </p>
                        {form.drip_step3_template.trim() ? (
                            <>
                                <p className="text-xs text-muted-foreground mt-3 mb-1">Step 3 (Day 14)</p>
                                <p className="text-sm font-mono bg-muted/50 rounded p-3 whitespace-pre-wrap">
                                    {renderCampaignPreview(form.drip_step3_template, context)}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-3">
                                Step 3 uses the Step 2 message (optional template left blank).
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
