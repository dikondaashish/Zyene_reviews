"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    AlertTriangle,
    BookOpen,
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    KeyRound,
    Link2,
    Send,
    Sparkles,
    Store,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ZapierSetupClientProps {
    appBaseUrl: string;
    apiKey: string | null;
    businessId: string;
    children?: ReactNode;
}

const SAMPLE_PAYLOAD = `{
  "name": "Sam Patel",
  "email": "sam@example.com",
  "phone": "+15551234567",
  "channel": "both"
}`;

export function ZapierSetupClient({
    appBaseUrl,
    apiKey,
    businessId,
    children,
}: ZapierSetupClientProps) {
    const webhookUrl = useMemo(() => {
        const key = apiKey ?? "YOUR_API_KEY";
        return `${appBaseUrl}/api/webhooks/generic?key=${key}`;
    }, [appBaseUrl, apiKey]);

    const businessIdShort = `${businessId.slice(0, 8)}…${businessId.slice(-4)}`;

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedPayload, setCopiedPayload] = useState(false);

    const handleCopy = async (
        value: string,
        kind: "url" | "payload",
        successMessage: string,
    ) => {
        if (kind === "url" && !apiKey) {
            toast.info("Generate an API key first on the Integrations page.");
            return;
        }
        try {
            await navigator.clipboard.writeText(value);
            if (kind === "url") {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 1800);
            } else {
                setCopiedPayload(true);
                setTimeout(() => setCopiedPayload(false), 1800);
            }
            toast.success(successMessage);
        } catch {
            toast.error("Could not copy to clipboard.");
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            {/* ── LEFT: How it works (matches dashboard stat-card accent style) ── */}
            <Card className="overflow-hidden border-l-4 border-l-primary border-border bg-card lg:col-span-2">
                <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        How it works
                    </p>
                    <h2 className="text-lg font-semibold tracking-tight">
                        Three steps from job done to review request sent
                    </h2>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                    <HowItWorksStep
                        index={1}
                        icon={Store}
                        iconWrapClass="bg-chart-4/15 text-chart-4 ring-chart-4/25"
                        title="Your POS or CRM fires the trigger"
                        description="When a job is completed, an invoice is paid, or a row is added to a sheet — pick whatever signals 'service is done'."
                    />
                    <HowItWorksStep
                        index={2}
                        icon={Link2}
                        iconWrapClass="bg-chart-2/15 text-chart-2 ring-chart-2/25"
                        title="Zapier sends customer details to Zyene"
                        description="Map the customer's name, phone, and/or email into the JSON body. The webhook URL has your API key built in."
                    />
                    <HowItWorksStep
                        index={3}
                        icon={Send}
                        iconWrapClass="bg-primary/10 text-primary ring-primary/25"
                        title="We send the review request automatically"
                        description="SMS, email, or both — using the same plan limits, opt-out logic, and templates as the dashboard."
                    />

                    <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-foreground/90">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sync-action" aria-hidden />
                        <p>
                            <span className="font-medium text-foreground">Tip:</span>{" "}
                            Set <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">channel</code> to{" "}
                            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">both</code> when you have a phone <em>and</em> an email — Zyene
                            will gracefully fall back to whichever channel succeeds if one fails.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* ── RIGHT: Setup ── */}
            <div className="space-y-6 lg:col-span-3">
                <Card className="overflow-hidden border-primary/20 bg-card">
                    <div className="h-1 w-full bg-gradient-to-r from-sync-action to-primary" />
                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-border/60 bg-muted/15 pb-4">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Setup
                            </p>
                            <h2 className="text-lg font-semibold tracking-tight">
                                Your webhook URL
                            </h2>
                        </div>
                        <Badge
                            className={
                                apiKey
                                    ? "border-0 bg-chart-2/15 text-xs text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                                    : "border-0 bg-muted text-xs text-muted-foreground"
                            }
                        >
                            {apiKey ? "Ready" : "Needs API key"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-5">
                        {!apiKey && (
                            <div className="flex items-start gap-2 rounded-md border border-chart-4/35 bg-chart-4/12 p-3 text-xs text-chart-4">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                <div className="space-y-2">
                                    <p>
                                        You need a Developer API key before you can use Zapier — the
                                        webhook URL is signed by it.
                                    </p>
                                    <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                                        <Link href="/settings/integrations#developer-api" className="inline-flex items-center gap-1.5">
                                            <KeyRound className="h-3 w-3" />
                                            Generate API key
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Webhook URL
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={webhookUrl}
                                    readOnly
                                    className="bg-muted/50 font-mono text-xs"
                                    onFocus={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => handleCopy(webhookUrl, "url", "Webhook URL copied")}
                                    disabled={!apiKey}
                                    aria-label="Copy webhook URL"
                                >
                                    {copiedUrl ? (
                                        <Check className="h-4 w-4 text-chart-2" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                                Treat this URL like a password — it includes your API key.
                                Connected to business{" "}
                                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                                    {businessIdShort}
                                </code>
                                .
                            </p>
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Example JSON body
                                </label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() =>
                                        handleCopy(SAMPLE_PAYLOAD, "payload", "Example payload copied")
                                    }
                                >
                                    {copiedPayload ? (
                                        <>
                                            <Check className="mr-1 h-3 w-3 text-chart-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-1 h-3 w-3" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
                                {SAMPLE_PAYLOAD}
                            </pre>
                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                                Optional <code className="font-mono">channel</code>:{" "}
                                <code className="font-mono">sms</code>,{" "}
                                <code className="font-mono">email</code>,{" "}
                                <code className="font-mono">both</code>, or{" "}
                                <code className="font-mono">link</code>. If omitted we pick
                                automatically based on which fields you send.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-border bg-card">
                    <CardHeader className="space-y-1 border-b border-border/60 bg-muted/15 pb-4">
                        <h2 className="text-lg font-semibold tracking-tight">
                            Configure your Zap
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Five minutes in Zapier — no code needed.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <ol className="space-y-4">
                            <SetupStep
                                index={1}
                                title="Open Zapier and create a Zap"
                                body={
                                    <>
                                        Go to{" "}
                                        <a
                                            href="https://zapier.com/app/zaps"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary underline-offset-4 hover:underline"
                                        >
                                            zapier.com/app/zaps
                                        </a>{" "}
                                        and click{" "}
                                        <span className="font-medium">Create Zap</span>.
                                    </>
                                }
                            />
                            <SetupStep
                                index={2}
                                title="Pick your POS or CRM as the trigger"
                                body={
                                    <>
                                        Examples: Square (Payment Created), Jobber (Job Completed),
                                        ServiceTitan, Housecall Pro, QuickBooks (Invoice Paid),
                                        Google Sheets (New Row), or anything else from the 5,000+
                                        apps Zapier supports.
                                    </>
                                }
                            />
                            <SetupStep
                                index={3}
                                title="Add Webhooks by Zapier as the action"
                                body={
                                    <>
                                        Search for <span className="font-medium">Webhooks by Zapier</span>{" "}
                                        and pick the <span className="font-mono">POST</span> action.
                                    </>
                                }
                            />
                            <SetupStep
                                index={4}
                                title="Paste the webhook URL"
                                body={
                                    <>
                                        Use the URL from the panel above — it already contains your API
                                        key. Set <span className="font-medium">Payload Type</span> to{" "}
                                        <span className="font-mono">json</span>.
                                    </>
                                }
                            />
                            <SetupStep
                                index={5}
                                title="Map the JSON fields"
                                body={
                                    <>
                                        Add the keys from the example payload and map them to the
                                        trigger output (e.g. customer name → <span className="font-mono">name</span>,
                                        customer email → <span className="font-mono">email</span>,
                                        customer phone → <span className="font-mono">phone</span>).
                                    </>
                                }
                            />
                            <SetupStep
                                index={6}
                                title="Test, then turn the Zap on"
                                body={
                                    <>
                                        Use Zapier&rsquo;s{" "}
                                        <span className="font-medium">Test Action</span> to send a sample
                                        through. Open{" "}
                                        <Link
                                            href="/requests"
                                            className="font-medium text-primary underline-offset-4 hover:underline"
                                        >
                                            Review Requests
                                        </Link>{" "}
                                        to confirm it lands, then publish your Zap.
                                    </>
                                }
                            />
                        </ol>
                    </CardContent>
                </Card>

                {children}

                <Card className="border-dashed border-border bg-muted/20">
                    <CardContent className="flex flex-col items-start justify-between gap-3 py-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold">Need a hand?</p>
                            <p className="text-xs text-muted-foreground">
                                Full payload reference, error codes, and curl recipes live in our docs.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href="/docs/cookbook"
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Open docs
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <a
                                    href="https://zapier.com/apps/webhook/integrations"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open Zapier
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function HowItWorksStep({
    index,
    icon: Icon,
    iconWrapClass,
    title,
    description,
}: {
    index: number;
    icon: React.ElementType;
    iconWrapClass: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground ring-1 ring-border">
                {index}
            </span>
            <div
                className={`mt-0.5 flex shrink-0 items-center justify-center rounded-lg ring-1 ${iconWrapClass} size-10`}
            >
                <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function SetupStep({
    index,
    title,
    body,
}: {
    index: number;
    title: string;
    body: React.ReactNode;
}) {
    return (
        <li className="flex gap-3">
            <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground ring-1 ring-border size-7">
                {index}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
        </li>
    );
}
