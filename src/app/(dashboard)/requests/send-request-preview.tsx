"use client";

import { Button } from "@/components/ui/button";
import type { FormValues } from "@/app/(dashboard)/requests/send-request-dialog-schema";

export type RequestPreview = { businessName: string; timezone: string; sms: string; email: string; subject: string; remainingSms: number | null; remainingEmail: number | null };
export function SendRequestPreview({ preview, values, loading, onBack, onConfirm }: {
    preview: RequestPreview; values: FormValues; loading: boolean; onBack: () => void; onConfirm: () => void;
}) {
    const sms = values.channel !== "email";
    const email = values.channel !== "sms";
    const exhausted = (sms && preview.remainingSms === 0) || (email && preview.remainingEmail === 0);
    return <div className="space-y-4">
        <h3 className="font-semibold">Review request for {preview.businessName}</h3>
        <p className="text-sm">To {values.customerName || "customer"}: {sms && values.customerPhone}{sms && email && " · "}{email && values.customerEmail}</p>
        <p className="text-sm text-muted-foreground">{values.scheduleEnabled ? `Scheduled: ${new Date(values.scheduleAt || "").toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone}, your device timezone).` : "Send immediately after confirmation."}</p>
        {sms && <section><h4 className="text-sm font-semibold">SMS message</h4><p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-sm">{preview.sms}</p><p className="mt-1 text-xs text-muted-foreground">1 SMS request · {preview.remainingSms ?? "Unlimited"} remaining this month. Carrier segmentation may vary.</p></section>}
        {email && <section><h4 className="text-sm font-semibold">Email: {preview.subject}</h4><p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-sm">{preview.email}</p><p className="mt-1 text-xs text-muted-foreground">1 email request · {preview.remainingEmail ?? "Unlimited"} remaining this month.</p></section>}
        <p className="text-xs text-muted-foreground">The tracking ID is added when created. Messages use your configured delivery sender. Scheduled requests are checked again at send time; opt-outs, test tags and frequency limits apply.</p>
        {exhausted && <p role="alert" className="text-sm text-destructive">A selected channel has no remaining allowance. Change the channel or review Billing.</p>}
        <div className="flex gap-2"><Button variant="outline" disabled={loading} onClick={onBack}>Back to edit</Button><Button disabled={loading || exhausted} onClick={onConfirm}>{loading ? "Processing…" : values.scheduleEnabled ? "Confirm schedule" : "Confirm and send"}</Button></div>
    </div>;
}
