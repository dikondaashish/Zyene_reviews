import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, HeartHandshake, Link2, MessageSquareReply, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { valueTier, type ValueSummary, type ValueTier } from "@/lib/dashboard/value-summary";
import { CUSTOMERS_PER_REVIEW, type AverageSale, type ReviewValue } from "@/lib/dashboard/review-value";
import { ValueStory } from "@/components/dashboard/value-story";

const fmt = (n: number) => n.toLocaleString("en-US");

const COPY: Record<ValueTier, { title: (name: string) => string; body: string }> = {
    strong: {
        title: (name) => `You're on a roll, ${name}!`,
        body: "Thank you for growing with Zyene. Your customers are showing up for you. Keep sharing your review link and take your brand to the next level.",
    },
    growing: {
        title: (name) => `Nice progress, ${name}!`,
        body: "Thanks for using Zyene. Every review builds trust in your brand. Keep the momentum going this month.",
    },
    quiet: {
        title: () => "Let's get your first win this month",
        body: "Share your review link or QR code with today's customers. Happy ones go to Google, unhappy ones come to you privately.",
    },
};

/** A small coloured pill per win; the colour matches what the win means. */
function Win({ icon: Icon, value, label, tone }: { icon: LucideIcon; value: number; label: string; tone: string }) {
    return (
        <li className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", tone)}>
            <Icon className="size-3.5" aria-hidden />
            <span className="font-semibold tabular-nums">{fmt(value)}</span>
            {label}
        </li>
    );
}

/**
 * A thank-you, then the value story (what they paid, what their reviews are worth), then the
 * month's other wins. Owners should see that Zyene pays for itself before anything else.
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
    const copy = COPY[tier];
    const wins = [
        { icon: Link2, value: s.linkVisits, label: "link visits", tone: "bg-primary/10 text-primary" },
        { icon: HeartHandshake, value: s.sentToGoogle, label: "sent to Google", tone: "bg-chart-2/15 text-success" },
        { icon: ShieldCheck, value: s.unhappyCaught, label: "caught privately", tone: "bg-chart-5/10 text-chart-5" },
        { icon: MessageSquareReply, value: s.zyeneReplies, label: "replies by Zyene", tone: "bg-chart-4/20 text-warning-foreground" },
    ];

    return (
        <section
            aria-labelledby="value-summary-title"
            className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-chart-4/10"
        >
            <div className="flex flex-col gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Your {monthLabel} with Zyene</p>
                        <h2 id="value-summary-title" className="ui-section-title mt-0.5 text-foreground">{copy.title(businessName)}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
                    </div>
                </div>

                <ValueStory
                    businessId={businessId}
                    newReviews={s.newReviews}
                    monthlyPrice={s.monthlyPrice}
                    averageSale={averageSale}
                    reviewValue={reviewValue}
                />

                {tier !== "quiet" && (
                    <ul className="flex flex-wrap gap-2" aria-label="Other wins this month">
                        {wins.map((win) => <Win key={win.label} {...win} />)}
                    </ul>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/70 bg-card/60 px-5 py-3 text-xs sm:px-6">
                <p className="text-muted-foreground">
                    Estimate: each new review ≈ {CUSTOMERS_PER_REVIEW} new customer at your average sale
                    {averageSale.source === "category" ? " (a typical figure for your type of business; tap it to use yours)." : "."}
                </p>
                <Link
                    href={tier === "quiet" ? "/requests" : "/analytics?platform=zyene"}
                    className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
                >
                    {tier === "quiet" ? "Send a review request" : "See your results"}
                    <ArrowRight className="size-3.5" aria-hidden />
                </Link>
            </div>
        </section>
    );
}
