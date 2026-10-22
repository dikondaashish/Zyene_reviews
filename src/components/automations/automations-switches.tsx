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
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
                <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{help}</p>
            </div>
            <Switch id={key} checked={values[key]} disabled={!canManage || pending} onCheckedChange={(v) => save(key, v)} />
        </div>
    );

    return (
        <section aria-labelledby="sending-switches-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="border-b border-border px-5 py-4 sm:px-6">
                <h2 id="sending-switches-title" className="ui-section-title">How requests reach customers</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Changes save instantly and apply to every campaign.
                    {canManage ? null : " Only owners, admins and managers can change these."}
                </p>
            </header>
            <div className="divide-y divide-border">
                {row("review_request_sms_enabled", "Text messages", "Turning this off also cancels texts and text reminders that are already scheduled.")}
                {row("review_request_email_enabled", "Emails", "Turning this off also cancels emails and email reminders that are already scheduled.")}
                {row("review_request_quiet_hours_enabled", "Quiet hours",
                    `No messages between ${settings.quietStart} and ${settings.quietEnd} (${settings.timezone || "UTC"}). Anything due then waits until morning.`)}
            </div>
            <p className="border-t border-border bg-muted/25 px-5 py-3 text-sm text-muted-foreground sm:px-6">
                Change quiet-hour times, reminder delays and how often a customer can be asked in{" "}
                <Link className="font-medium text-foreground underline underline-offset-4" href="/settings/business-information">
                    review request settings
                </Link>.
            </p>
        </section>
    );
}
