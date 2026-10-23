"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { InboundSettings } from "@/services/enrollment/inbound-settings-api";

/** Invoice-copy enrollment: BCC a unique address on invoices to enroll the customer. */
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

    const copyAddress = async () => {
        if (!initial.address) return;
        try {
            await navigator.clipboard.writeText(initial.address);
            toast.success("Address copied");
        } catch {
            toast.error("Could not copy. Select the address and copy it instead.");
        }
    };

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
        <section id="invoice-enrollment" aria-labelledby="invoice-enrollment-title" className="scroll-mt-24 overflow-hidden rounded-xl border bg-card">
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                <div className="min-w-0">
                    <h2 id="invoice-enrollment-title" className="ui-section-title">Sign up customers from your invoice emails</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Every time you email an invoice or receipt, that customer can be added to a review campaign. No lists to upload.
                    </p>
                </div>
                <Switch checked={enabled} disabled={disabled} onCheckedChange={setEnabled} aria-label="Turn on invoice email sign-ups" />
            </header>
            {!initial.configured && (
                <p className="mx-5 mt-5 rounded-lg border border-dashed p-3 text-sm text-muted-foreground sm:mx-6">
                    Not available on your account yet. You can fill this in now; it starts working once we finish switching on email receiving.
                </p>
            )}
            <ol className="space-y-6 p-5 sm:p-6">
                <Step n={1} title="Copy your sign-up address">
                    {initial.address ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <code className="break-all rounded-md bg-muted px-2 py-1.5 text-sm text-foreground">{initial.address}</code>
                            <Button type="button" variant="outline" size="sm" onClick={copyAddress}>Copy</Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {initial.configured
                                ? "Your address is created the first time you save this section. Choose a campaign below, then press Save."
                                : "Your address appears here once email receiving is switched on for your account."}
                        </p>
                    )}
                </Step>
                <Step n={2} title="Add it as a hidden copy (BCC) in your invoicing tool">
                    <p className="text-sm leading-6 text-muted-foreground">
                        Do this once, in QuickBooks, Square, Jobber or whatever you send invoices from. Customers never see it.
                    </p>
                </Step>
                <Step n={3} title="Choose where those customers go">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="inbound-campaign">Campaign</Label>
                            <select id="inbound-campaign" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={campaignId}
                                disabled={disabled} onChange={(e) => setCampaignId(e.target.value)}>
                                <option value="">Choose a campaign</option>
                                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}{c.status === "paused" ? " (paused)" : ""}</option>)}
                            </select>
                            <p className="text-xs leading-5 text-muted-foreground">New customers are invited a few per day.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="inbound-senders">Who sends your invoices</Label>
                            <Textarea id="inbound-senders" rows={3} value={senders} disabled={disabled} onChange={(e) => setSenders(e.target.value)}
                                placeholder={"you@gmail.com\nbilling@yourshop.com"} />
                            <p className="text-xs leading-5 text-muted-foreground">
                                One per line. Include your invoicing tool&apos;s sending address, or @yourdomain.com for your whole domain.
                                Mail from anyone else is ignored.
                            </p>
                        </div>
                    </div>
                </Step>
            </ol>
            <footer className="flex flex-col gap-3 border-t border-border bg-muted/25 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs leading-5 text-muted-foreground">
                    We only keep the customer&apos;s email address, never the invoice. Your own team is never signed up.
                </p>
                {canManage && <Button onClick={save} disabled={pending} className="self-start sm:self-auto">Save</Button>}
            </footer>
        </section>
    );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
    return (
        <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
            <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden>{n}</span>
            <div className="min-w-0 space-y-2">
                <h3 className="ui-card-title pt-0.5 text-foreground">{title}</h3>
                {children}
            </div>
        </li>
    );
}
