"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { NotificationPreferenceFormValues } from "@/types/components";

// Schema for Form Interface (what the inputs use)
const formSchema = z.object({
    sms_enabled: z.boolean(),
    phone_number: z.string().optional(),
    email_enabled: z.boolean(),
    digest_enabled: z.boolean(),
    min_urgency_score: z.string(), // Kept as string for Select compatibility
    quiet_hours_start: z.string().optional(),
    quiet_hours_end: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function FieldHelpTip({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className="inline-flex shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={label}
                >
                    <CircleHelp className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className="max-w-[min(320px,calc(100vw-2rem))] text-balance px-3 py-2.5 text-left text-xs font-normal leading-relaxed"
            >
                {children}
            </TooltipContent>
        </Tooltip>
    );
}

export function NotificationForm({
    businessId,
    initialPrefs,
}: {
    businessId: string;
    initialPrefs: NotificationPreferenceFormValues;
    userId?: string;
}) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sms_enabled: initialPrefs?.sms_enabled ?? true,
            phone_number:
                initialPrefs?.phone_number ||
                initialPrefs?.sms_phone_number ||
                "",
            email_enabled: initialPrefs?.email_enabled ?? true,
            digest_enabled: initialPrefs?.digest_enabled ?? true,
            min_urgency_score: (
                initialPrefs?.min_urgency_score ?? initialPrefs?.min_urgency_for_sms ?? 7
            ).toString(),
            quiet_hours_start: initialPrefs?.quiet_hours_start || "",
            quiet_hours_end: initialPrefs?.quiet_hours_end || "",
        },
    });

    async function onSubmit(data: FormValues) {
        setIsSaving(true);
        try {
            // Convert string to number for API
            const minUrgency = Number.parseInt(data.min_urgency_score, 10);
            const payload = {
                business_id: businessId,
                sms_enabled: data.sms_enabled,
                email_enabled: data.email_enabled,
                digest_enabled: data.digest_enabled,
                phone_number: data.phone_number?.trim() || null,
                min_urgency_score: Number.isFinite(minUrgency) ? minUrgency : 7,
                quiet_hours_start: data.quiet_hours_start?.trim() || null,
                quiet_hours_end: data.quiet_hours_end?.trim() || null,
            };

            const res = await fetch("/api/settings/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save settings");

            toast.success("Notification settings saved");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <TooltipProvider delayDuration={200}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">

                {/* Email Alerts */}
                <FormField
                    control={form.control}
                    name="email_enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5 pr-2">
                                <div className="flex items-center gap-2">
                                    <FormLabel className="text-base">Email alerts</FormLabel>
                                    <FieldHelpTip label="What email alerts do">
                                        <p>
                                            Sends an email to you <strong>right away</strong> when there is a new public
                                            review or a private feedback alert for <strong>this business</strong>. Your
                                            dashboard always has the full details; this is only the instant heads-up.
                                            Separate from the weekly digest.
                                        </p>
                                    </FieldHelpTip>
                                </div>
                                <FormDescription>
                                    Receive emails for new reviews.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="digest_enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5 pr-2">
                                <div className="flex items-center gap-2">
                                    <FormLabel className="text-base">Weekly digest</FormLabel>
                                    <FieldHelpTip label="What the weekly digest is">
                                        <p>
                                            One summary email (usually Monday morning) with new reviews from the{" "}
                                            <strong>last 7 days</strong> and a short snapshot for this business. You can
                                            keep this on while turning off instant email alerts, or the other way
                                            around—they work independently.
                                        </p>
                                    </FieldHelpTip>
                                </div>
                                <FormDescription>
                                    Get a weekly email with new reviews from the past seven days (typically sent Monday mornings).
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* SMS Alerts */}
                <FormField
                    control={form.control}
                    name="sms_enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5 pr-2">
                                <div className="flex items-center gap-2">
                                    <FormLabel className="text-base">SMS alerts</FormLabel>
                                    <FieldHelpTip label="What SMS alerts do">
                                        <p>
                                            Sends a <strong>text message</strong> only for urgent review alerts: when the
                                            urgency score is at or above your minimum, or the review is{" "}
                                            <strong>1–2 stars</strong>. You must save a phone number below. Texts pause
                                            during quiet hours. Customer review-request texts are separate from this
                                            setting.
                                        </p>
                                    </FieldHelpTip>
                                </div>
                                <FormDescription>
                                    Receive text messages for urgent reviews.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.watch("sms_enabled") && (
                    <div className="space-y-4 border-l-2 border-border pl-4 animate-in slide-in-from-top-2">
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Phone number</FormLabel>
                                        <FieldHelpTip label="Why we need your phone number">
                                            <p>
                                                Used <strong>only</strong> for SMS alerts to you (the business). We do
                                                not use this number for customer review-request messages. Include your
                                                country code so texts can be delivered.
                                            </p>
                                        </FieldHelpTip>
                                    </div>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Include country code (e.g., +1 for US).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="min_urgency_score"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Minimum urgency score</FormLabel>
                                        <FieldHelpTip label="What urgency score means for SMS">
                                            <p>
                                                We text you when a review’s urgency is <strong>at least</strong> this
                                                number, or when it is <strong>1–2 stars</strong> (so you still hear about
                                                very unhappy customers). A <strong>higher</strong> score means{" "}
                                                <strong>fewer</strong> texts; a lower score means more texts.
                                            </p>
                                        </FieldHelpTip>
                                    </div>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select score" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[5, 6, 7, 8, 9, 10].map(score => (
                                                <SelectItem key={score} value={score.toString()}>
                                                    {score} {score >= 9 ? "(Critical only)" : score >= 7 ? "(Urgent)" : "(Moderate)"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Only alert for reviews with this urgency score or higher.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium leading-none">Quiet hours</span>
                                <FieldHelpTip label="What quiet hours do">
                                    <p>
                                        During this window we <strong>do not send SMS</strong> alerts. Instant emails and
                                        the weekly digest are <strong>not</strong> affected—only texts. If your quiet
                                        period crosses midnight, both times are still used correctly.
                                    </p>
                                </FieldHelpTip>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="quiet_hours_start"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground">Start</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quiet_hours_end"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground">End</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <FormDescription>
                            SMS alerts will be paused during these hours.
                        </FormDescription>
                    </div>
                )}

                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
                </form>
            </Form>
        </TooltipProvider>
    );
}
