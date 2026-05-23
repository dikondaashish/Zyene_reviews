import {
    Calendar,
    Lock,
    Mail,
    Megaphone,
    MessageSquare,
    Upload,
    Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CampaignForm } from "./new-campaign-form-types";

interface NewCampaignBasicsStepProps {
    form: CampaignForm;
    updateForm: (updates: Partial<CampaignForm>) => void;
}

export function NewCampaignBasicsStep({ form, updateForm }: NewCampaignBasicsStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Campaign Basics</h2>
                <p className="text-sm text-muted-foreground">Give your campaign a name and choose how to reach customers.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Post-Visit Follow-up"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                />
            </div>

            <div className="space-y-3">
                <Label>Channel</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {([
                        { value: "sms" as const, label: "SMS", icon: MessageSquare, desc: "Text message" },
                        { value: "email" as const, label: "Email", icon: Mail, desc: "Email message" },
                        { value: "both" as const, label: "Both", icon: Megaphone, desc: "SMS + Email" },
                    ]).map((ch) => (
                        <button
                            key={ch.value}
                            onClick={() => updateForm({ channel: ch.value })}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors
                                ${form.channel === ch.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                        >
                            <ch.icon className={`h-6 w-6 ${form.channel === ch.value ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="font-medium text-sm">{ch.label}</span>
                            <span className="text-xs text-muted-foreground">{ch.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Trigger Type</Label>
                <div className="grid grid-cols-1 gap-3">
                    {([
                        { value: "manual_batch" as const, label: "Manual Batch", icon: Upload, desc: "Upload or enter a list of contacts to send to", available: true },
                        { value: "scheduled" as const, label: "Scheduled", icon: Calendar, desc: "Send at specific times (e.g. every Friday at 2pm)", available: true },
                        { value: "pos_payment" as const, label: "After Payment", icon: Zap, desc: "Automatically send after a POS transaction", available: false },
                    ]).map((tr) => (
                        <button
                            key={tr.value}
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
                            <tr.icon className={`h-5 w-5 shrink-0 ${form.trigger_type === tr.value ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{tr.label}</span>
                                    {!tr.available && <Badge variant="outline" className="text-xs"><Lock className="mr-1 h-3 w-3" />Coming Soon</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground">{tr.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
