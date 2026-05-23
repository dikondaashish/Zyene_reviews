import { Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignMessageStepProps {
    form: CampaignForm;
    updateForm: (updates: Partial<CampaignForm>) => void;
    smsCharCount: number;
    previewSMS: string;
}

export function NewCampaignMessageStep({
    form,
    updateForm,
    smsCharCount,
    previewSMS,
}: NewCampaignMessageStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Message Templates</h2>
                <p className="text-sm text-muted-foreground">
                    Craft your review request message. Use {"{customer_name}"}, {"{business_name}"}, and {"{review_link}"} as placeholders.
                </p>
            </div>

            {(form.channel === "sms" || form.channel === "both") && (
                <div className="space-y-3">
                    <Label htmlFor="sms_template">SMS Template</Label>
                    <Textarea
                        id="sms_template"
                        value={form.sms_template}
                        onChange={(e) => updateForm({ sms_template: e.target.value })}
                        rows={4}
                        className="font-mono text-sm"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            Characters: <span className={smsCharCount > 160 ? "text-destructive font-semibold" : ""}>{smsCharCount}</span> / 160
                            {smsCharCount > 160 && " (will send as multiple SMS)"}
                        </span>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                        </div>
                        <div className="relative max-w-[280px]">
                            <div className="rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-primary-foreground text-sm">
                                {previewSMS}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(form.channel === "email" || form.channel === "both") && (
                <>
                    {form.channel === "both" && <Separator />}
                    <div className="space-y-3">
                        <Label htmlFor="email_subject">Email Subject</Label>
                        <Input
                            id="email_subject"
                            value={form.email_subject}
                            onChange={(e) => updateForm({ email_subject: e.target.value })}
                            placeholder="How was your visit?"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="email_template">Email Body</Label>
                        <Textarea
                            id="email_template"
                            value={form.email_template}
                            onChange={(e) => updateForm({ email_template: e.target.value })}
                            rows={8}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            HTML is supported. Use placeholders like {"{customer_name}"} and {"{review_link}"}.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
