import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { REMINDER_DELAY_OPTIONS } from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";

interface Props {
    form: CampaignForm;
    updateForm: (updates: Partial<CampaignForm>) => void;
}

function dayLabel(hours: number): string {
    const days = Math.round(hours / 24);
    return days === 1 ? "1 day" : `${days} days`;
}

/** Reminder steps 2 and 3: delay, stop rules and copy. */
export function NewCampaignReminderSettings({ form, updateForm }: Props) {
    const delay = form.follow_up_delay_hours;
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Label htmlFor="campaign-reminder">Send reminders</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                        Up to 2 reminders, {dayLabel(delay)} apart. Reminders always stop when the customer finishes the
                        review page, opts out, unsubscribes, or you mark their review as confirmed.
                    </p>
                </div>
                <Switch
                    id="campaign-reminder"
                    checked={form.follow_up_enabled}
                    onCheckedChange={(checked) => updateForm({ follow_up_enabled: checked })}
                />
            </div>

            {form.follow_up_enabled && (
                <div className="space-y-4 border-l-2 border-primary/20 rounded-r-lg bg-muted/30 p-4">
                    <div className="space-y-2">
                        <Label>Time between reminders</Label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {REMINDER_DELAY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    aria-pressed={delay === opt.value}
                                    onClick={() => updateForm({ follow_up_delay_hours: opt.value })}
                                    className={`rounded-lg border-2 px-2 py-1.5 text-sm font-medium transition-colors ${
                                        delay === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Applies to reminders not yet sent, including for contacts already in this campaign.
                        </p>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <Label htmlFor="stop-on-click">Stop reminders after the customer opens the link</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                On by default. Opening the link does not prove a review was posted; turn this off to keep
                                reminding until they finish the review page.
                            </p>
                        </div>
                        <Switch
                            id="stop-on-click"
                            checked={form.stop_on_click}
                            onCheckedChange={(checked) => updateForm({ stop_on_click: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="follow_up_template">Reminder 1 (after {dayLabel(delay)})</Label>
                        <Textarea
                            id="follow_up_template"
                            value={form.follow_up_template}
                            onChange={(e) => updateForm({ follow_up_template: e.target.value })}
                            rows={3}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="drip_step3_template">Reminder 2 (after {dayLabel(delay * 2)}) - optional</Label>
                        <p className="text-xs text-muted-foreground">Leave blank to reuse the first reminder.</p>
                        <Textarea
                            id="drip_step3_template"
                            value={form.drip_step3_template}
                            onChange={(e) => updateForm({ drip_step3_template: e.target.value })}
                            placeholder="Falls back to the first reminder if left blank"
                            rows={3}
                            className="font-mono text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
