import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, HeartHandshake, Link2, MessageSquareReply, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    HOURLY_RATE_USD,
    MINUTES_PER_REPLY,
    MINUTES_PER_REQUEST,
    valueTier,
    type ValueSummary,
    type ValueTier,
} from "@/lib/dashboard/value-summary";

const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

function Chip({ icon: Icon, value, label, tone }: { icon: LucideIcon; value: string; label: string; tone: string }) {
    return (
        <li className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-2">
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", tone)}>
                <Icon className="size-3.5" aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
                <span className="block text-base font-semibold tabular-nums text-foreground">{value}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{label}</span>
            </span>
        </li>
    );
}

/**
 * A short thank-you with the month's wins, so owners see Zyene is working for them. Results
 * come first; the price follows as "what each win cost", never as a bill.
 */
export function ValueSummaryCard({ summary: s, monthLabel, businessName }: { summary: ValueSummary; monthLabel: string; businessName: string }) {
    const tier = valueTier(s);
    const copy = COPY[tier];
    const chips = [
        { icon: Link2, value: fmt(s.linkVisits), label: "Link visits", tone: "bg-primary/10 text-primary" },
        { icon: HeartHandshake, value: fmt(s.sentToGoogle), label: "Sent to Google", tone: "bg-chart-2/15 text-success" },
        {
            icon: s.newReviewsChange > 0 ? TrendingUp : Star,
            value: fmt(s.newReviews),
            label: s.newReviewsChange > 0 ? `New reviews · +${fmt(s.newReviewsChange)}` : "New reviews",
            tone: "bg-chart-4/15 text-warning-foreground",
        },
        { icon: ShieldCheck, value: fmt(s.unhappyCaught), label: "Caught privately", tone: "bg-primary/10 text-primary" },
        { icon: MessageSquareReply, value: fmt(s.zyeneReplies), label: "Replies by Zyene", tone: "bg-primary/10 text-primary" },
    ];

    return (
        <section
            aria-labelledby="value-summary-title"
            className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-5"
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Your {monthLabel} with Zyene</p>
                        <h2 id="value-summary-title" className="ui-section-title mt-0.5 text-foreground">
                            {copy.title(businessName)}
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
                    </div>
                </div>
                {tier !== "quiet" && (
                    <ul className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:w-[40rem] xl:grid-cols-5">
                        {chips.map((chip) => <Chip key={chip.label} {...chip} />)}
                    </ul>
                )}
            </div>
            <ValueFooter summary={s} tier={tier} />
        </section>
    );
}

function ValueFooter({ summary: s, tier }: { summary: ValueSummary; tier: ValueTier }) {
    const timeNote = `Estimate: ${MINUTES_PER_REPLY} min per reply and ${MINUTES_PER_REQUEST} min per request you'd otherwise do by hand, at $${HOURLY_RATE_USD}/hr.`;
    // Under an hour reads as "not much", so only mention time once it's worth saying.
    const showTime = s.hoursSaved >= 1;
    const value =
        s.monthlyPrice === 0 && s.sentToGoogle > 0
            ? "Every win above came free during your trial."
            : s.costPerGoogleCustomer !== null
              ? `That's just ${usd(s.costPerGoogleCustomer)} per happy customer sent to Google.`
              : null;

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-xs">
            <p className="text-muted-foreground">
                {value && <span className="font-medium text-foreground">{value}</span>}
                {showTime && (
                    <span title={timeNote}>{value ? " · " : ""}About {Math.round(s.hoursSaved)} hrs of your time saved</span>
                )}
                {!value && !showTime && tier === "quiet" && <span>Your results will show here as customers respond.</span>}
            </p>
            <Link
                href={tier === "quiet" ? "/requests" : "/analytics?platform=zyene"}
                className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
            >
                {tier === "quiet" ? "Send a review request" : "See your results"}
                <ArrowRight className="size-3.5" aria-hidden />
            </Link>
        </div>
    );
}
