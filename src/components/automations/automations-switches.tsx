"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { OverviewSettings } from "@/services/automations/load-automations-overview";

type Key = "review_request_sms_enabled" | "review_request_email_enabled" | "review_request_quiet_hours_enabled";

/** Working on/off switches for sending channels and quiet hours (saved immediately). */
export function AutomationsSwitches({ businessId, settings, canManage }: { businessId: string; settings: OverviewSettings; canManage: boolean }) {
    const router = useRouter();
    const [values, setValues] = useState({
        review_request_sms_enabled: settings.smsEnabled,
        review_request_email_enabled: settings.emailEnabled,
        review_request_quiet_hours_enabled: settings.quietHoursEnabled,
    });
    const [pending, startTransition] = useTransition();

    const save = (key: Key, value: boolean) => {
        const previous = values[key];
        setValues((v) => ({ ...v, [key]: value }));
        startTransition(async () => {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: value }),
            });
            if (!response.ok) {
                setValues((v) => ({ ...v, [key]: previous }));
                toast.error("Could not save. Only owners, admins and managers can change this.");
                return;
            }
            toast.success("Saved");
            router.refresh();
        });
    };

    const row = (key: Key, label: string, help: string) => (
        <div className="flex items-start justify-between gap-4 py-3">
            <div>
                <Label htmlFor={key}>{label}</Label>
                <p className="text-xs text-muted-foreground">{help}</p>
            </div>
            <Switch id={key} checked={values[key]} disabled={!canManage || pending} onCheckedChange={(v) => save(key, v)} />
        </div>
    );

    return (
        <section className="divide-y rounded-lg border bg-card px-4">
            {row("review_request_sms_enabled", "Text message requests", "Off also stops queued texts and SMS reminders (they're skipped with a reason).")}
            {row("review_request_email_enabled", "Email requests", "Off also stops queued emails and email reminders.")}
            {row("review_request_quiet_hours_enabled", "Quiet hours",
                `Hold messages between ${settings.quietStart} and ${settings.quietEnd} (${settings.timezone || "UTC"}). Change the times in settings.`)}
            <p className="py-3 text-xs text-muted-foreground">
                More options (delays, frequency cap, quiet-hour times) in <Link className="underline" href="/settings/business-information">Review request settings</Link>.
            </p>
        </section>
    );
}
