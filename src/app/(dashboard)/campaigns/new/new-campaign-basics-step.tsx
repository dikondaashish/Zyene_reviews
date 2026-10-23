import {
    Calendar,
    CreditCard,
    Lock,
    Mail,
    Megaphone,
    MessageSquare,
    Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignBasicsStepProps {
    audienceSelected?: boolean;
    form: CampaignForm;
    updateForm: (updates: Partial<CampaignForm>) => void;
}

export function NewCampaignBasicsStep({ form, updateForm, audienceSelected }: NewCampaignBasicsStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="ui-section-title mb-1">Name and channel</h2>
                <p className="text-sm text-muted-foreground">Name it so you can find it later, and pick how customers hear from you.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Campaign name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Post-Visit Follow-up"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                />
            </div>

            <div className="space-y-3">
                <Label>Send by</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {([
                        { value: "sms" as const, label: "Text message", icon: MessageSquare, desc: "Most people read texts within minutes" },
                        { value: "email" as const, label: "Email", icon: Mail, desc: "Room for a longer, personal note" },
                        { value: "both" as const, label: "Both", icon: Megaphone, desc: "Text and email, whichever we have" },
                    ]).map((ch) => (
                        <button
                            key={ch.value}
                            type="button"
                            aria-pressed={form.channel === ch.value}
                            onClick={() => updateForm({ channel: ch.value })}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors
                                ${form.channel === ch.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                        >
                            <ch.icon className={`${form.channel === ch.value ? "text-primary" : "text-muted-foreground"} size-6`} />
                            <span className="font-medium text-sm">{ch.label}</span>
                            <span className="text-xs text-muted-foreground">{ch.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {!audienceSelected && <div className="space-y-3">
                <Label>When do customers get it?</Label>
                <div className="grid grid-cols-1 gap-3">
                    {([
                        { value: "manual_batch" as const, label: "When I add customers", icon: Upload, desc: "Pick customers or upload a list; they are asked after the delay you set", available: true },
                        { value: "scheduled" as const, label: "On a schedule", icon: Calendar, desc: "Send at set times, for example every Friday at 2pm", available: true },
                        { value: "pos_payment" as const, label: "After each payment", icon: CreditCard, desc: "Ask automatically when a customer pays at your till", available: false },
                    ]).map((tr) => (
                        <button
                            key={tr.value}
                            type="button"
                            aria-pressed={form.trigger_type === tr.value}
                            disabled={!tr.available}
                            onClick={() => tr.available && updateForm({ trigger_type: tr.value })}
                            className={`flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors
                                ${!tr.available
                                    ? "border-border opacity-50 cursor-not-allowed"
                                    : form.trigger_type === tr.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                        >
                            <tr.icon className={`shrink-0 ${form.trigger_type === tr.value ? "text-primary" : "text-muted-foreground"} size-5`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{tr.label}</span>
                                    {!tr.available && <Badge variant="outline" className="text-xs"><Lock className="mr-1 size-3" />Coming soon</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground">{tr.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>}
        </div>
    );
}
