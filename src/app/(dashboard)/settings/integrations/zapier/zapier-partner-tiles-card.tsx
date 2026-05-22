import type { ReactNode } from "react";
import { siGooglesheets, siQuickbooks, siSquare } from "simple-icons";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SimpleIconData = { title: string; hex: string; path: string };

function SimpleIconMark({ icon }: { icon: SimpleIconData }) {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-border dark:bg-white">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <title>{icon.title}</title>
                <path fill={`#${icon.hex}`} d={icon.path} />
            </svg>
        </div>
    );
}

/** High-res favicon via Google — used when a brand is not in Simple Icons. */
function FaviconMark({ domain, label }: { domain: string; label: string }) {
    const src = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-border dark:bg-white">
            <img
                src={src}
                alt={`${label} logo`}
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
            />
        </div>
    );
}

const PARTNERS: {
    name: string;
    blurb: string;
    mark: ReactNode;
}[] = [
    {
        name: "Square",
        blurb: "After a Square payment",
        mark: <SimpleIconMark icon={siSquare} />,
    },
    {
        name: "Jobber",
        blurb: "When a job is closed",
        mark: <FaviconMark domain="jobber.com" label="Jobber" />,
    },
    {
        name: "ServiceTitan",
        blurb: "Invoice marked paid",
        mark: <FaviconMark domain="servicetitan.com" label="ServiceTitan" />,
    },
    {
        name: "Housecall Pro",
        blurb: "Job completed",
        mark: <FaviconMark domain="housecallpro.com" label="Housecall Pro" />,
    },
    {
        name: "QuickBooks",
        blurb: "Invoice marked paid",
        mark: <SimpleIconMark icon={siQuickbooks} />,
    },
    {
        name: "Google Sheets",
        blurb: "New row added",
        mark: <SimpleIconMark icon={siGooglesheets} />,
    },
];

/**
 * Server Component — imports `simple-icons` here so the heavy icon index
 * never ships in the client bundle for the Zapier setup form.
 */
export function ZapierPartnerTilesCard() {
    return (
        <Card className="overflow-hidden rounded-lg border border-border bg-card">
            <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20 pb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                    Popular tools that work via Zapier
                </h2>
                <p className="text-sm text-muted-foreground">
                    Anything Zapier supports works here — these are the ones our customers wire up most often.
                </p>
            </CardHeader>
            <CardContent className="pt-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {PARTNERS.map((app) => (
                        <div
                            key={app.name}
                            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                        >
                            {app.mark}
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{app.name}</p>
                                <p className="truncate text-[11px] text-muted-foreground">{app.blurb}</p>
                                <Badge
                                    variant="secondary"
                                    className="mt-1.5 gap-1 border-0 bg-chart-2/15 px-1.5 py-0.5 text-[10px] font-medium text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                                >
                                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
                                    Works via Zapier
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
