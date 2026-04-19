"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import {
    AlertTriangle,
    Check,
    ChevronDown,
    ExternalLink,
    Flame,
    Loader2,
    RefreshCw,
    Reply,
    Send,
    Sparkles,
    Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatThemeTag(tag: string): string {
    return tag
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Demo / offline fallback only — mirrors professional / friendly / concise intent. */
function buildDemoDraft(review: NeedsAttentionReview, tone: ReplyTone): string {
    const first = review.author.split(/\s+/)[0] || "there";
    const snippet = review.text.trim().slice(0, 200);
    const tagLine =
        review.tags.length > 0
            ? ` We’re also reviewing your note on ${review.tags.slice(0, 2).map(formatThemeTag).join(" & ")}.`
            : "";

    if (tone === "concise") {
        return `Hi ${first},\n\nThank you for the feedback — we’re sorry we missed the mark.${tagLine}\n\nPlease contact us directly so we can make this right.\n\n— The owner`;
    }
    if (tone === "friendly") {
        return `Hi ${first},\n\nThanks so much for telling us about this — we really appreciate you taking the time.${tagLine}\n\nWe’re sorry you had a rough experience and we’d love the chance to make it better. Reach out anytime and we’ll take care of you personally.\n\nWarmly,\n— The owner`;
    }
    return `Hi ${first},\n\nThank you for your honest feedback. I’m sorry we fell short on this visit.${tagLine}\n\nWe’re addressing this with our team right away, and I’d welcome the opportunity to make it right for you.\n\n${snippet ? `You mentioned: “${snippet}${review.text.length > 200 ? "…" : ""}”\n\n` : ""}Please reach out if you’d like to connect directly.\n\nRespectfully,\n— The owner`;
}

async function fetchSuggestReply(reviewId: string, tone: ReplyTone): Promise<string> {
    const res = await fetch("/api/ai/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, tone }),
    });
    const json = (await res.json()) as {
        success?: boolean;
        data?: { reply?: string };
        error?: string;
        code?: string;
    };
    if (!res.ok) {
        const err = new Error(json.error || "Failed to get suggestion") as Error & { code?: string };
        err.code = json.code;
        throw err;
    }
    if (json.success && json.data && typeof json.data.reply === "string") {
        return json.data.reply;
    }
    throw new Error("Invalid AI response");
}

export type NeedsAttentionReview = {
    id: string;
    author: string;
    /** Google/Yelp reviewer photo when synced (`reviews.author_avatar_url`). */
    avatarUrl?: string | null;
    rating: number;
    urgency: number;
    /** ISO string — must be JSON-serializable when passed from a Server Component. */
    date: string;
    text: string;
    tags: string[];
    /** `google` (default) or `yelp` — only Google supports in-app reply posting. */
    platform?: string;
};

/** Plain strings only (no functions) so `copy` can cross the RSC → client boundary. */
export type NeedsAttentionCopy = {
    title: string;
    subtitleZero: string;
    subtitleOne: string;
    /** Use `{count}` placeholder for counts greater than 1. */
    subtitleMany: string;
    viewAll: string;
    yourReplyLabel: string;
    sentToGoogle: string;
    draftWithAi: string;
    drafting: string;
    writeYourOwn: string;
    regenerate: string;
    adjustTone: string;
    toneProfessional: string;
    toneFriendly: string;
    toneConcise: string;
    sendReply: string;
    sent: string;
    /** Use `{score}` placeholder. */
    urgencyLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    /** Shown under Send when demo data is active (cannot post to Google). */
    demoSendHint: string;
};

function subtitleFor(copy: NeedsAttentionCopy, urgentCount: number): string {
    if (urgentCount <= 0) return copy.subtitleZero;
    if (urgentCount === 1) return copy.subtitleOne;
    return copy.subtitleMany.replace("{count}", String(urgentCount));
}

function urgencyText(copy: NeedsAttentionCopy, score: number): string {
    return copy.urgencyLabel.replace("{score}", String(score));
}

const DEFAULT_COPY: NeedsAttentionCopy = {
    title: "Needs your attention",
    subtitleZero: "No urgent reviews right now",
    subtitleOne: "1 urgent review — we can draft a response for you",
    subtitleMany: "{count} urgent reviews — we can draft responses for you",
    viewAll: "View all",
    yourReplyLabel: "Your reply as owner",
    sentToGoogle: "Posted to Google",
    draftWithAi: "Draft response with AI",
    drafting: "Drafting…",
    writeYourOwn: "Or write your own",
    regenerate: "Regenerate",
    adjustTone: "Adjust tone",
    toneProfessional: "Professional",
    toneFriendly: "Friendly",
    toneConcise: "Concise",
    sendReply: "Send reply",
    sent: "Sent",
    urgencyLabel: "Urgency {score}",
    emptyTitle: "All clear!",
    emptyDescription: "No urgent reviews need your attention right now.",
    demoSendHint: "Connect Google Business Profile to post replies from here.",
};

function initialsFromAuthor(author: string): string {
    const parts = author.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    const one = parts[0] || "?";
    return one.slice(0, 2).toUpperCase();
}

export function NeedsAttention({
    reviews,
    viewAllHref = "/reviews?status=needs_response&sort=lowest",
    copy: copyProp,
    className,
    planAllowsAiReplies = true,
    isDemo = false,
}: {
    reviews: NeedsAttentionReview[];
    viewAllHref?: string;
    copy?: Partial<NeedsAttentionCopy>;
    className?: string;
    /** Starter+ — same gate as the reviews inbox AI suggester. */
    planAllowsAiReplies?: boolean;
    /** Simulated drafts only; posting to Google is disabled. */
    isDemo?: boolean;
}) {
    const copy = useMemo(() => ({ ...DEFAULT_COPY, ...copyProp }), [copyProp]);
    const router = useRouter();
    const streamTimers = useRef<Record<string, ReturnType<typeof setInterval> | null>>({});

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [sent, setSent] = useState<Record<string, boolean>>({});
    const [generating, setGenerating] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
    const [tones, setTones] = useState<Record<string, ReplyTone>>({});
    const [toneCache, setToneCache] = useState<Record<string, Partial<Record<ReplyTone, string>>>>({});
    const [aiTyping, setAiTyping] = useState<Record<string, boolean>>({});
    const [manualCompose, setManualCompose] = useState<Record<string, boolean>>({});
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeModalKind, setUpgradeModalKind] = useState<"limit" | "plan">("limit");

    const stopAiStream = useCallback((id: string) => {
        const t = streamTimers.current[id];
        if (t != null) {
            clearInterval(t);
            streamTimers.current[id] = null;
        }
        setAiTyping((a) => ({ ...a, [id]: false }));
    }, []);

    const startAiStream = useCallback(
        (id: string, full: string) => {
            stopAiStream(id);
            if (!full) {
                setDrafts((d) => ({ ...d, [id]: "" }));
                return;
            }
            setDrafts((d) => ({ ...d, [id]: "" }));
            setAiTyping((a) => ({ ...a, [id]: true }));
            let i = 0;
            const charsPerTick = 2;
            const intervalMs = 14;
            streamTimers.current[id] = setInterval(() => {
                i = Math.min(i + charsPerTick, full.length);
                setDrafts((d) => ({ ...d, [id]: full.slice(0, i) }));
                if (i >= full.length) {
                    stopAiStream(id);
                }
            }, intervalMs);
        },
        [stopAiStream]
    );

    useEffect(() => {
        const timers = streamTimers.current;
        return () => {
            for (const k of Object.keys(timers)) {
                const t = timers[k];
                if (t != null) clearInterval(t);
            }
        };
    }, []);

    const urgentCount = reviews.length;

    const runDraft = useCallback(
        async (
            review: NeedsAttentionReview,
            toneOverride?: ReplyTone,
            opts?: { bypassCache?: boolean }
        ) => {
            const id = review.id;
            const tone: ReplyTone = toneOverride ?? tones[id] ?? "professional";
            const platform = review.platform ?? "google";

            if (platform === "yelp") {
                toast.error("Use Yelp for Business to reply to Yelp reviews.");
                return;
            }

            stopAiStream(id);

            if (!planAllowsAiReplies && !isDemo) {
                setUpgradeModalKind("plan");
                setShowUpgradeModal(true);
                return;
            }

            if (isDemo) {
                setTones((t) => ({ ...t, [id]: tone }));
                setGenerating((g) => ({ ...g, [id]: true }));
                try {
                    await new Promise((r) => setTimeout(r, 600));
                    const text = buildDemoDraft(review, tone);
                    setToneCache((tc) => ({
                        ...tc,
                        [id]: { ...tc[id], [tone]: text },
                    }));
                    startAiStream(id, text);
                } finally {
                    setGenerating((g) => ({ ...g, [id]: false }));
                }
                return;
            }

            if (!UUID_RE.test(id)) {
                toast.error("This review cannot use AI drafting from here.");
                return;
            }

            setTones((t) => ({ ...t, [id]: tone }));

            const cached = !opts?.bypassCache ? toneCache[id]?.[tone] : undefined;
            if (cached) {
                startAiStream(id, cached);
                return;
            }

            setGenerating((g) => ({ ...g, [id]: true }));
            try {
                const reply = await fetchSuggestReply(id, tone);
                setToneCache((tc) => ({
                    ...tc,
                    [id]: { ...tc[id], [tone]: reply },
                }));
                startAiStream(id, reply);
            } catch (e: unknown) {
                const err = e as Error & { code?: string };
                const message = err?.message || "Failed to get suggestion";
                if (err.code === "AI_REPLY_PLAN_REQUIRED") {
                    setUpgradeModalKind("plan");
                    setShowUpgradeModal(true);
                } else if (
                    message.includes("Monthly AI reply limit") ||
                    message.includes("upgrade your plan")
                ) {
                    setUpgradeModalKind("limit");
                    setShowUpgradeModal(true);
                } else {
                    toast.error(message);
                }
            } finally {
                setGenerating((g) => ({ ...g, [id]: false }));
            }
        },
        [isDemo, planAllowsAiReplies, startAiStream, stopAiStream, toneCache, tones]
    );

    const sendReply = useCallback(
        async (review: NeedsAttentionReview) => {
            const id = review.id;
            const draft = drafts[id] ?? "";
            if (!draft.trim()) return;

            if ((review.platform ?? "google") === "yelp") {
                toast.error("Only Google reviews can be replied to from here.");
                return;
            }

            if (isDemo) {
                toast.message(copy.demoSendHint);
                return;
            }

            if (!UUID_RE.test(id)) {
                toast.error("This review cannot be posted from here.");
                return;
            }

            stopAiStream(id);
            setSubmitting((s) => ({ ...s, [id]: true }));
            try {
                const res = await fetch(`/api/reviews/${id}/reply`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: draft }),
                });
                const data = (await res.json().catch(() => ({}))) as { error?: string };
                if (!res.ok) throw new Error(data.error || "Failed to reply");

                toast.success("Reply posted successfully");
                setSent((s) => ({ ...s, [id]: true }));
                setToneCache((tc) => {
                    const next = { ...tc };
                    delete next[id];
                    return next;
                });
                window.setTimeout(() => {
                    setExpandedId(null);
                    router.refresh();
                }, 1200);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Failed to reply";
                if (
                    message.includes("Monthly AI reply limit") ||
                    message.includes("upgrade your plan")
                ) {
                    setUpgradeModalKind("limit");
                    setShowUpgradeModal(true);
                } else {
                    toast.error(message);
                }
            } finally {
                setSubmitting((s) => ({ ...s, [id]: false }));
            }
        },
        [copy.demoSendHint, drafts, isDemo, router, stopAiStream]
    );

    const toggleRow = (id: string) => {
        setExpandedId((cur) => (cur === id ? null : id));
    };

    if (reviews.length === 0) {
        return (
            <div
                className={cn(
                    "overflow-hidden rounded-[14px] border border-border bg-card text-card-foreground shadow-sm",
                    className
                )}
            >
                <div className="border-b border-border bg-chart-4/20 px-5 py-4 dark:bg-chart-4/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <AlertTriangle className="h-4 w-4" aria-hidden />
                        </div>
                        <div>
                            <p className="text-[13.5px] font-semibold tracking-tight text-foreground">{copy.title}</p>
                            <p className="text-[11.5px] text-muted-foreground">{subtitleFor(copy, 0)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                    <div className="rounded-full bg-chart-2/15 p-3 dark:bg-chart-2/10">
                        <Check className="h-6 w-6 text-chart-2" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-foreground">{copy.emptyTitle}</p>
                    <p className="max-w-xs text-sm text-muted-foreground">{copy.emptyDescription}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "overflow-hidden rounded-[14px] border border-border bg-card text-card-foreground shadow-sm",
                className
            )}
        >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-chart-4/25 px-5 py-4 dark:bg-chart-4/15">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <AlertTriangle className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold tracking-tight text-foreground">{copy.title}</p>
                        <p className="truncate text-[11.5px] text-muted-foreground">{subtitleFor(copy, urgentCount)}</p>
                    </div>
                </div>
                {viewAllHref ? (
                    <Button variant="ghost" size="sm" className="shrink-0 text-[13px]" asChild>
                        <Link href={viewAllHref}>{copy.viewAll}</Link>
                    </Button>
                ) : null}
            </div>

            <ul className="divide-y divide-border">
                {reviews.map((review) => {
                    const open = expandedId === review.id;
                    const id = review.id;
                    const draft = drafts[id] ?? "";
                    const isGen = !!generating[id];
                    const isSub = !!submitting[id];
                    const isSent = !!sent[id];
                    const typing = !!aiTyping[id];
                    const rating = Math.min(5, Math.max(0, Math.round(review.rating)));
                    const urgency = Math.min(10, Math.max(0, Math.round(review.urgency)));
                    const showUrgency = urgency >= 8;
                    const platform = review.platform ?? "google";
                    const isYelp = platform === "yelp";

                    const dateLabel = (() => {
                        try {
                            return formatDistanceToNow(new Date(review.date), { addSuffix: true });
                        } catch {
                            return "";
                        }
                    })();

                    return (
                        <li key={id} className="bg-card">
                            <button
                                type="button"
                                onClick={() => toggleRow(id)}
                                className={cn(
                                    "flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition-colors",
                                    "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                )}
                                aria-expanded={open}
                            >
                                <Avatar className="h-[34px] w-[34px] shrink-0 ring-1 ring-border">
                                    {review.avatarUrl?.trim() ? (
                                        <AvatarImage
                                            src={review.avatarUrl.trim()}
                                            alt={review.author}
                                            referrerPolicy="no-referrer"
                                            className="object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-destructive/15 text-[11px] font-bold text-destructive dark:bg-destructive/25 dark:text-destructive-foreground">
                                        <span className="font-display tracking-tight">
                                            {initialsFromAuthor(review.author)}
                                        </span>
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[13.5px] font-semibold text-foreground">{review.author}</span>
                                        <span className="inline-flex items-center gap-0.5" aria-label={`${rating} of 5 stars`}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    strokeWidth={i < rating ? 0 : 1.35}
                                                    className={cn(
                                                        "h-2.5 w-2.5 shrink-0 text-chart-4",
                                                        i < rating ? "fill-chart-4" : "fill-none"
                                                    )}
                                                    aria-hidden
                                                />
                                            ))}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">· {dateLabel}</span>
                                        {showUrgency ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11.5px] font-semibold tracking-[0.02em] text-destructive dark:bg-destructive/25 dark:text-destructive-foreground">
                                                <Flame className="h-3 w-3" aria-hidden />
                                                {urgencyText(copy, urgency)}
                                            </span>
                                        ) : null}
                                        {isSent ? (
                                            <Badge
                                                variant="secondary"
                                                className="border-chart-2/30 bg-chart-2/15 text-chart-2 dark:bg-chart-2/20"
                                            >
                                                <Check className="mr-1 h-3 w-3" aria-hidden />
                                                {copy.sent}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    {review.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {review.tags.slice(0, 4).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-muted-foreground"
                                                >
                                                    {formatThemeTag(tag)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                    <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{review.text}</p>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                        open && "rotate-180"
                                    )}
                                    aria-hidden
                                />
                            </button>

                            {open ? (
                                <div
                                    className={cn(
                                        "border-t border-border bg-muted/50 pb-4 pl-[70px] pr-5 pt-3",
                                        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                                    )}
                                >
                                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <Reply className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                                {copy.yourReplyLabel}
                                            </span>
                                            {isSent ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="border-chart-2/30 bg-chart-2/15 text-chart-2 dark:bg-chart-2/20"
                                                >
                                                    <Check className="mr-1 h-3 w-3" aria-hidden />
                                                    {copy.sentToGoogle}
                                                </Badge>
                                            ) : null}
                                        </div>

                                        {isYelp ? (
                                            <div className="flex items-start gap-2 rounded-lg border border-chart-4/35 bg-chart-4/10 px-3 py-2.5 text-xs text-chart-4">
                                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                                <span>
                                                    Replies to Yelp reviews must be made on{" "}
                                                    <a
                                                        href="https://biz.yelp.com"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-0.5 font-medium underline hover:text-chart-4"
                                                    >
                                                        yelp.com
                                                        <ExternalLink className="h-3 w-3" aria-hidden />
                                                    </a>
                                                    .
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                {!isGen && !manualCompose[id] && !(id in drafts) ? (
                                                    <div className="flex flex-col items-center gap-2 py-2">
                                                        <Button
                                                            type="button"
                                                            className="gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void runDraft(review, "professional");
                                                            }}
                                                        >
                                                            <Sparkles className="h-4 w-4" aria-hidden />
                                                            {copy.draftWithAi}
                                                        </Button>
                                                        <button
                                                            type="button"
                                                            className="text-[11px] text-primary underline-offset-2 hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setManualCompose((m) => ({ ...m, [id]: true }));
                                                                setDrafts((d) => ({ ...d, [id]: "" }));
                                                            }}
                                                        >
                                                            {copy.writeYourOwn}
                                                        </button>
                                                    </div>
                                                ) : null}

                                                {isGen ? (
                                                    <div className="flex justify-center py-3">
                                                        <Button type="button" disabled className="gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                                            {copy.drafting}
                                                        </Button>
                                                    </div>
                                                ) : null}

                                                {(manualCompose[id] || id in drafts) && !isGen ? (
                                                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                                        {(planAllowsAiReplies || isDemo) ? (
                                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                                <Sparkles className="h-3.5 w-3.5 text-sync-action" aria-hidden />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                    AI tone
                                                                </span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {(
                                                                        [
                                                                            "professional",
                                                                            "friendly",
                                                                            "concise",
                                                                        ] as const
                                                                    ).map((tone) => (
                                                                        <button
                                                                            key={tone}
                                                                            type="button"
                                                                            disabled={isGen || isSub || typing}
                                                                            onClick={() => void runDraft(review, tone)}
                                                                            className={cn(
                                                                                "rounded-full border px-3 py-1 text-[11px] font-semibold capitalize transition-colors",
                                                                                (tones[id] ?? "professional") === tone
                                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted"
                                                                            )}
                                                                        >
                                                                            {tone === "professional" && copy.toneProfessional}
                                                                            {tone === "friendly" && copy.toneFriendly}
                                                                            {tone === "concise" && copy.toneConcise}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : null}

                                                        <div className="relative">
                                                            <Textarea
                                                                value={draft}
                                                                onChange={(e) => {
                                                                    if (typing) stopAiStream(id);
                                                                    setDrafts((d) => ({
                                                                        ...d,
                                                                        [id]: e.target.value,
                                                                    }));
                                                                }}
                                                                placeholder="Write your reply…"
                                                                className={cn(
                                                                    "min-h-[110px] resize-y border-border bg-muted/40 text-[13px] text-foreground",
                                                                    typing &&
                                                                        "border-sync-action/30 ring-1 ring-sync-action/20"
                                                                )}
                                                                readOnly={isSent}
                                                                aria-busy={typing}
                                                            />
                                                            {typing ? (
                                                                <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-sync-action/20 bg-sync-action/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sync-action">
                                                                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sync-action" />
                                                                    Writing
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        {!isSent ? (
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="gap-1 text-muted-foreground"
                                                                        disabled={isSub}
                                                                        onClick={() =>
                                                                            void runDraft(review, tones[id] ?? "professional", {
                                                                                bypassCache: true,
                                                                            })
                                                                        }
                                                                    >
                                                                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                                                                        {copy.regenerate}
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button type="button" variant="ghost" size="sm">
                                                                                {copy.adjustTone} ▾
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="start">
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    void runDraft(review, "professional")
                                                                                }
                                                                            >
                                                                                {copy.toneProfessional}
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => void runDraft(review, "friendly")}
                                                                            >
                                                                                {copy.toneFriendly}
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => void runDraft(review, "concise")}
                                                                            >
                                                                                {copy.toneConcise}
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        className="gap-2 bg-primary text-primary-foreground hover:brightness-95"
                                                                        disabled={
                                                                            isSub ||
                                                                            !draft.trim() ||
                                                                            typing ||
                                                                            isDemo
                                                                        }
                                                                        onClick={() => void sendReply(review)}
                                                                    >
                                                                        {isSub ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                                                        ) : (
                                                                            <Send className="h-4 w-4" aria-hidden />
                                                                        )}
                                                                        {copy.sendReply}
                                                                    </Button>
                                                                    {isDemo ? (
                                                                        <p className="max-w-[220px] text-right text-[10px] text-muted-foreground">
                                                                            {copy.demoSendHint}
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="flex items-center gap-1 text-sm font-medium text-chart-2">
                                                                <Check className="h-4 w-4" aria-hidden />
                                                                {copy.sent}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title={
                    upgradeModalKind === "plan"
                        ? "Upgrade for AI reply suggestions"
                        : "Upgrade your plan"
                }
                description={
                    upgradeModalKind === "plan"
                        ? "AI-assisted replies are available on Starter, Professional, and Enterprise. Choose a plan to continue."
                        : "You've reached your monthly AI reply limit. Please upgrade your plan to continue using AI features."
                }
            />
        </div>
    );
}
