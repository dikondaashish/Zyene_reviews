import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, HeartHandshake, Link2, MessageSquareReply, PartyPopper, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { valueTier, type ValueSummary, type ValueTier } from "@/lib/dashboard/value-summary";
import type { AverageSale, ReviewValue } from "@/lib/dashboard/review-value";
import { paybackLabel, ValueStory } from "@/components/dashboard/value-story";

const fmt = (n: number) => n.toLocaleString("en-US");

const TITLE: Record<ValueTier, (name: string) => string> = {
    strong: (name) => `You're on a roll, ${name}!`,
    growing: (name) => `Thanks, ${name}!`,
    quiet: () => "Your next review is one share away.",
};

/** A tiny stat; the icon colour says what the win means. */
function Win({ icon: Icon, value, label, tone }: { icon: LucideIcon; value: number; label: string; tone: string }) {
    return (
        <li className="inline-flex items-center gap-1">
            <Icon className={cn("size-3", tone)} aria-hidden />
            <span className="font-semibold tabular-nums text-foreground">{fmt(value)}</span>
            {label}
        </li>
    );
}

/**
 * A slim thank-you strip: what this month's reviews are worth against the plan price, plus
 * the month's other wins in small print. Owners see that Zyene pays for itself at a glance.
 */
export function ValueSummaryCard({
    businessId,
    businessName,
    monthLabel,
    summary: s,
    averageSale,
    reviewValue,
}: {
    businessId: string;
    businessName: string;
    monthLabel: string;
    summary: ValueSummary;
    averageSale: AverageSale;
    reviewValue: ReviewValue;
}) {
    const tier = valueTier(s);
    const payback = paybackLabel(s.newReviews, s.monthlyPrice, reviewValue);
    const wins = [
        { icon: Link2, value: s.linkVisits, label: "link visits", tone: "text-primary" },
        { icon: HeartHandshake, value: s.sentToGoogle, label: "sent to Google", tone: "text-success" },
        { icon: ShieldCheck, value: s.unhappyCaught, label: "caught privately", tone: "text-chart-5" },
        { icon: MessageSquareReply, value: s.zyeneReplies, label: "replies by Zyene", tone: "text-warning" },
    ];

    return (
        <section
            aria-labelledby="value-summary-title"
            className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-chart-2/10 px-3.5 py-2.5"
        >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 basis-[calc(100%-2.5rem)] text-sm text-muted-foreground md:basis-0">
                    <span id="value-summary-title" className="mr-1 font-semibold text-foreground">{TITLE[tier](businessName)}</span>
                    <ValueStory
                        businessId={businessId}
                        monthLabel={monthLabel}
                        newReviews={s.newReviews}
                        averageSale={averageSale}
                        reviewValue={reviewValue}
                    />
                </div>
                <div className="flex shrink-0 items-center gap-3 max-md:pl-10">
                    {payback && (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
                            <PartyPopper className="size-3.5" aria-hidden />
                            {payback}
                        </span>
                    )}
                    <Link
                        href={tier === "quiet" ? "/requests" : "/analytics?platform=zyene"}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                        {tier === "quiet" ? "Send a request" : "Details"}
                        <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                </div>
            </div>
            {tier !== "quiet" && (
                <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 pl-10 text-[11px] text-muted-foreground" aria-label="Other wins this month">
                    {wins.map((win) => <Win key={win.label} {...win} />)}
                </ul>
            )}
        </section>
    );
}
