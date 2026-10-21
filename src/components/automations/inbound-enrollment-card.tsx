"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { InboundSettings } from "@/services/enrollment/inbound-settings-api";

/** Invoice-copy enrollment: CC/BCC a unique address on invoices to enroll the customer. */
export function InboundEnrollmentCard({
    businessId, initial, campaigns, canManage,
}: {
    businessId: string; initial: InboundSettings; campaigns: { id: string; name: string; status: string }[]; canManage: boolean;
}) {
    const router = useRouter();
    const [enabled, setEnabled] = useState(initial.enabled);
    const [campaignId, setCampaignId] = useState(initial.campaignId ?? "");
    const [senders, setSenders] = useState(initial.allowedSenders.join("\n"));
    const [pending, startTransition] = useTransition();
    const disabled = !canManage || pending;

    const save = () => startTransition(async () => {
        const response = await fetch("/api/settings/inbound-enrollment", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId, enabled, campaignId: campaignId || null, allowedSenders: senders.split(/[\s,]+/).filter(Boolean) }),
        });
        const body = await response.json().catch(() => null) as { error?: string } | null;
        if (!response.ok) {
            toast.error(body?.error || "Could not save");
            return;
        }
        toast.success("Email enrollment saved");
        router.refresh();
    });

    return (
        <section className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="ui-section-title">Enroll customers from invoice emails</h2>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        CC or BCC your enrollment address on invoices or receipts. The customer is added to the chosen campaign (a few per day).
                        Only mail from your allowed senders counts; your team, your business and your own domain are never enrolled. We keep
                        only the addresses, never the invoice.
                    </p>
                </div>
                <Switch checked={enabled} disabled={disabled} onCheckedChange={setEnabled} aria-label="Enable email enrollment" />
            </div>
            {!initial.configured && (
                <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    Not available yet: inbound email isn&apos;t set up on this account. Your settings are saved, but no email can arrive until it is.
                </p>
            )}
            {initial.address && <p className="text-sm">Your address: <code className="rounded bg-muted px-1">{initial.address}</code></p>}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="inbound-campaign">Campaign</Label>
                    <select id="inbound-campaign" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={campaignId}
                        disabled={disabled} onChange={(e) => setCampaignId(e.target.value)}>
                        <option value="">Choose a campaign</option>
                        {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}{c.status === "paused" ? " (paused)" : ""}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="inbound-senders">Allowed senders</Label>
                    <Textarea id="inbound-senders" rows={3} value={senders} disabled={disabled} onChange={(e) => setSenders(e.target.value)}
                        placeholder={"billing@yourshop.com\n@yourinvoicing.com"} />
                    <p className="text-xs text-muted-foreground">One per line: an exact address, or @domain for a whole domain.</p>
                </div>
            </div>
            {canManage && <Button onClick={save} disabled={pending}>Save</Button>}
        </section>
    );
}
