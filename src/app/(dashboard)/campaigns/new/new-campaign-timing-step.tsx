import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DELAY_OPTIONS, FOLLOW_UP_OPTIONS } from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignTimingStepProps {
    form: CampaignForm;
    updateForm: (updates: Partial<CampaignForm>) => void;
}

export function NewCampaignTimingStep({ form, updateForm }: NewCampaignTimingStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Timing & Follow-up</h2>
                <p className="text-sm text-muted-foreground">
                    Control when messages are sent and whether to send follow-ups.
                </p>
            </div>

            <div className="space-y-3">
                <Label>Send Delay</Label>
                <p className="text-xs text-muted-foreground">How long after adding contacts should the message be sent?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {DELAY_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
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

            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Label>Follow-up Message</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sent to contacts who haven&apos;t opened/clicked the first message
                        </p>
                    </div>
                    <Switch
                        checked={form.follow_up_enabled}
                        onCheckedChange={(checked) => updateForm({ follow_up_enabled: checked })}
                    />
                </div>

                {form.follow_up_enabled && (
                    <div className="space-y-4 pl-0 border-l-2 border-primary/20 ml-0 rounded-r-lg bg-muted/30 p-4">
                        <div className="space-y-2">
                            <Label>Follow-up Delay</Label>
                            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:grid-cols-3">
                                {FOLLOW_UP_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => updateForm({ follow_up_delay_hours: opt.value })}
                                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors
                                            ${form.follow_up_delay_hours === opt.value
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="follow_up_template">Follow-up Template</Label>
                            <Textarea
                                id="follow_up_template"
                                value={form.follow_up_template}
                                onChange={(e) => updateForm({ follow_up_template: e.target.value })}
                                rows={3}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
