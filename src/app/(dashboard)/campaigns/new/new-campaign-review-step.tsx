import { renderCampaignPreview, type CampaignPreviewContext } from "@/lib/campaigns/preview";
import { DELAY_OPTIONS } from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";
import { CampaignReplyEmailNote } from "./campaign-reply-email-note";

const TRIGGER_LABEL: Record<CampaignForm["trigger_type"], string> = {
    manual_batch: "When I add customers",
    scheduled: "On a schedule",
    pos_payment: "After each payment",
};

interface NewCampaignReviewStepProps {
    context: CampaignPreviewContext;
    form: CampaignForm;
    customerCount?: number;
}

export function NewCampaignReviewStep({ form, context, customerCount = 0 }: NewCampaignReviewStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="ui-section-title mb-1">Check and start</h2>
                <p className="text-sm text-muted-foreground">
                    This is what a customer of {context.businessName} will get, shown with a sample name and link. Times follow your business timezone ({context.timezone}). Each message counts toward your plan.
                </p>
            </div>

            <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-semibold">{customerCount ? `${customerCount} customer${customerCount === 1 ? "" : "s"} will be asked` : "No customers added yet"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{customerCount ? "Starting the campaign sends to everyone who can be reached. People who opted out, or have no phone or email for this channel, are skipped. Saving without starting sends nothing and does not keep this selection." : "Save the campaign, then add customers from its page to start asking."}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Campaign name</p>
                        <p className="font-semibold">{form.name}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Send by</p>
                        <p className="font-semibold">{form.channel === "both" ? "Text and email" : form.channel === "sms" ? "Text message" : "Email"}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Customers get it</p>
                        <p className="font-semibold">{TRIGGER_LABEL[form.trigger_type]}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">First message</p>
                        <p className="font-semibold">
                            {DELAY_OPTIONS.find((d) => d.value === form.delay_minutes)?.label || "Right away"}
                        </p>
                    </div>
                </div>

                {(form.channel === "sms" || form.channel === "both") && (
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-2">Text message</p>
                        <p className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded p-3">{renderCampaignPreview(form.sms_template, context)}</p>
                    </div>
                )}

                {(form.channel === "email" || form.channel === "both") && <CampaignReplyEmailNote replyEmail={context.replyEmail} />}

                {(form.channel === "email" || form.channel === "both") && (
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Email subject</p>
                        <p className="text-sm font-semibold mb-2">{renderCampaignPreview(form.email_subject, context)}</p>
                        <p className="text-xs text-muted-foreground mb-2">Email message</p>
                        <div className="text-sm bg-muted/50 rounded p-3 font-mono whitespace-pre-wrap">{renderCampaignPreview(form.email_template, context)}</div>
                    </div>
                )}

                {form.follow_up_enabled && (
                    <div className="rounded-lg border border-primary/20 p-4">
                        <p className="text-xs text-muted-foreground mb-1">Reminders</p>
                        <p className="text-sm">
                            Up to 2 reminders, {Math.round(form.follow_up_delay_hours / 24)} {Math.round(form.follow_up_delay_hours / 24) === 1 ? "day" : "days"} apart.{" "}
                            {form.stop_on_click ? "Stops when the customer opens the link" : "Keeps reminding after a link open"},
                            finishes the review page, opts out, or you confirm their review. Publication is not verified automatically.
                        </p>
                        <p className="text-xs text-muted-foreground mt-3 mb-1">Reminder 1</p>
                        <p className="text-sm font-mono bg-muted/50 rounded p-3 whitespace-pre-wrap">
                            {renderCampaignPreview(form.follow_up_template, context)}
                        </p>
                        {form.drip_step3_template.trim() ? (
                            <>
                                <p className="text-xs text-muted-foreground mt-3 mb-1">Reminder 2</p>
                                <p className="text-sm font-mono bg-muted/50 rounded p-3 whitespace-pre-wrap">
                                    {renderCampaignPreview(form.drip_step3_template, context)}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-3">
                                Reminder 2 reuses the Reminder 1 message.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
