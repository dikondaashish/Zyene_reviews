import { Link2, Send, Sparkles, Store } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { HowItWorksStep } from "./zapier-setup-step-items";

export function ZapierHowItWorksCard() {
    return (
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
                    description="When a job is completed, an invoice is paid, or a row is added to a sheet ,  pick whatever signals 'service is done'."
                />
                <HowItWorksStep
                    index={2}
                    icon={Link2}
                    iconWrapClass="bg-chart-2/15 text-chart-2 ring-chart-2/25"
                    title="Zapier sends customer details to Zyene"
                    description="Map the customer's details into JSON and authenticate with a Bearer API key header. The URL never contains the secret."
                />
                <HowItWorksStep
                    index={3}
                    icon={Send}
                    iconWrapClass="bg-primary/10 text-primary ring-primary/25"
                    title="We send the review request automatically"
                    description="SMS, email, or both ,  using the same plan limits, opt-out logic, and templates as the dashboard."
                />

                <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-foreground/90">
                    <Sparkles className="mt-0.5 shrink-0 text-sync-action size-3.5" aria-hidden />
                    <p>
                        <span className="font-medium text-foreground">Tip:</span>{" "}
                        Set <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">channel</code> to{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">both</code> when you have a phone <em>and</em> an email, Zyene
                        will gracefully fall back to whichever channel succeeds if one fails.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
