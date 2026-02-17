"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Clock,
    Mail,
    MessageSquare,
    Megaphone,
    Zap,
    Calendar,
    Upload,
    Lock,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const STEPS = ["Basics", "Message", "Timing", "Review & Launch"];

const DELAY_OPTIONS = [
    { value: 0, label: "Immediately" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 240, label: "4 hours" },
    { value: 1440, label: "1 day" },
];

const FOLLOW_UP_OPTIONS = [
    { value: 24, label: "24 hours" },
    { value: 48, label: "48 hours" },
    { value: 72, label: "72 hours" },
];

const DEFAULT_SMS = "Hi {customer_name}! Thanks for visiting {business_name}. We'd love your feedback — takes 30 seconds: {review_link}";
const DEFAULT_EMAIL_SUBJECT = "How was your visit to {business_name}?";
const DEFAULT_EMAIL_BODY = `<p>Hi {customer_name},</p>
<p>Thank you for visiting {business_name}! We'd really appreciate your feedback — it helps us improve and helps others discover us.</p>
<p><a href="{review_link}">Leave a Review</a></p>
<p>It only takes about 30 seconds. Thank you!</p>`;
const DEFAULT_FOLLOW_UP = "Hi {customer_name}, just a friendly reminder — we'd love to hear about your experience at {business_name}: {review_link}";

interface CampaignForm {
    name: string;
    channel: "sms" | "email" | "both";
    trigger_type: "manual_batch" | "scheduled" | "pos_payment";
    sms_template: string;
    email_subject: string;
    email_template: string;
    delay_minutes: number;
    follow_up_enabled: boolean;
    follow_up_delay_hours: number;
    follow_up_template: string;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<CampaignForm>({
        name: "",
        channel: "sms",
        trigger_type: "manual_batch",
        sms_template: DEFAULT_SMS,
        email_subject: DEFAULT_EMAIL_SUBJECT,
        email_template: DEFAULT_EMAIL_BODY,
        delay_minutes: 0,
        follow_up_enabled: false,
        follow_up_delay_hours: 48,
        follow_up_template: DEFAULT_FOLLOW_UP,
    });

    const updateForm = (updates: Partial<CampaignForm>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    const smsCharCount = form.sms_template.length;

    const previewSMS = form.sms_template
        .replace(/\{customer_name\}/g, "Sarah")
        .replace(/\{business_name\}/g, "Sunrise Café")
        .replace(/\{review_link\}/g, `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/sunrise-cafe`);

    const canProceed = () => {
        switch (step) {
            case 0:
                return form.name.trim().length > 0;
            case 1:
                if (form.channel === "sms" || form.channel === "both") {
                    return form.sms_template.trim().length > 0;
                }
                if (form.channel === "email") {
                    return form.email_subject.trim().length > 0 && form.email_template.trim().length > 0;
                }
                return true;
            case 2:
                return true;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const saveCampaign = async (status: "draft" | "active") => {
        setSaving(true);
        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, status }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create campaign");
            }

            toast.success(status === "active" ? "Campaign launched!" : "Campaign saved as draft");
            router.push("/campaigns");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
                    <p className="text-muted-foreground">
                        Set up an automated review request campaign
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <button
                            onClick={() => i < step && setStep(i)}
                            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors
                                ${i === step
                                    ? "bg-primary text-primary-foreground"
                                    : i < step
                                        ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                                        : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                            <span className="hidden sm:inline">{s}</span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <Card>
                <CardContent className="p-6">
                    {/* Step 1: Basics */}
                    {step === 0 && (
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
                                <div className="grid grid-cols-3 gap-3">
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
                    )}

                    {/* Step 2: Message */}
                    {step === 1 && (
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
                                            Characters: <span className={smsCharCount > 160 ? "text-red-500 font-semibold" : ""}>{smsCharCount}</span> / 160
                                            {smsCharCount > 160 && " (will send as multiple SMS)"}
                                        </span>
                                    </div>

                                    {/* Preview */}
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
                                            <Eye className="h-3.5 w-3.5" />
                                            Preview
                                        </div>
                                        <div className="relative max-w-[280px]">
                                            <div className="rounded-2xl rounded-bl-sm bg-blue-600 px-4 py-3 text-white text-sm">
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
                    )}

                    {/* Step 3: Timing */}
                    {step === 2 && (
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
                                <div className="grid grid-cols-5 gap-2">
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
                                <div className="flex items-center justify-between">
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
                                            <div className="grid grid-cols-3 gap-2">
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
                    )}

                    {/* Step 4: Review & Launch */}
                    {step === 3 && (
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
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => step > 0 ? setStep(step - 1) : router.push("/campaigns")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {step > 0 ? "Back" : "Cancel"}
                </Button>

                <div className="flex items-center gap-2">
                    {step === STEPS.length - 1 ? (
                        <>
                            <Button variant="outline" onClick={() => saveCampaign("draft")} disabled={saving}>
                                Save as Draft
                            </Button>
                            <Button onClick={() => saveCampaign("active")} disabled={saving}>
                                {saving ? "Saving..." : "Launch Campaign"}
                                {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
