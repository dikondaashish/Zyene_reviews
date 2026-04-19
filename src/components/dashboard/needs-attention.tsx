"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    AlertTriangle,
    Check,
    ChevronDown,
    Flame,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NeedsAttentionReview = {
    id: string;
    author: string;
    /** Optional 1–2 letter override; otherwise initials are derived from `author`. */
    avatar?: string;
    rating: number;
    urgency: number;
    date: string | Date;
    text: string;
    tags: string[];
};

export type NeedsAttentionCopy = {
    title: string;
    subtitle: (urgentCount: number) => string;
    viewAll: string;
    yourReplyLabel: string;
    sentToGoogle: string;
    draftWithAi: string;
    drafting: string;
    writeYourOwn: string;
    regenerate: string;
    adjustTone: string;
    toneProfessional: string;
    toneWarm: string;
    toneBrief: string;
    sendReply: string;
    sent: string;
    urgencyLabel: (score: number) => string;
    emptyTitle: string;
    emptyDescription: string;
};

const DEFAULT_COPY: NeedsAttentionCopy = {
    title: "Needs your attention",
    subtitle: (n) =>
        n === 0
            ? "No urgent reviews right now"
            : n === 1
              ? "1 urgent review — we can draft a response for you"
              : `${n} urgent reviews — we can draft responses for you`,
    viewAll: "View all",
    yourReplyLabel: "Your reply as owner",
    sentToGoogle: "Saved as draft",
    draftWithAi: "Draft response with AI",
    drafting: "Drafting…",
    writeYourOwn: "Or write your own",
    regenerate: "Regenerate",
    adjustTone: "Adjust tone",
    toneProfessional: "Professional",
    toneWarm: "Warm",
    toneBrief: "Brief",
    sendReply: "Send reply",
    sent: "Sent",
    urgencyLabel: (score) => `Urgency ${score}`,
    emptyTitle: "All clear!",
    emptyDescription: "No urgent reviews need your attention right now.",
};

function initialsFromAuthor(author: string, override?: string): string {
    if (override?.trim()) return override.trim().slice(0, 2).toUpperCase();
    const parts = author.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    const one = parts[0] || "?";
    return one.slice(0, 2).toUpperCase();
}

type ToneKind = "professional" | "warm" | "brief";

function buildOwnerDraft(review: NeedsAttentionReview, kind: ToneKind): string {
    const first = review.author.split(/\s+/)[0] || "there";
    const snippet = review.text.trim().slice(0, 200);
    const tagLine =
        review.tags.length > 0 ? ` We’re also reviewing your note on ${review.tags.slice(0, 2).join(" & ")}.` : "";

    if (kind === "brief") {
        return `Hi ${first},\n\nThank you for taking the time to write in. We’re sorry your experience didn’t match what we aim for, and we’re on it.${tagLine}\n\nPlease reach us directly if we can make this right.\n\n— The owner`;
    }
    if (kind === "warm") {
        return `Hi ${first},\n\nWe’re truly grateful you shared this with us — it matters a lot. I’m sorry things fell short for you here.${tagLine}\n\nWe’d love the chance to make this better. If you’re open to it, reply here or contact us and we’ll take care of you personally.\n\nWarmly,\n— The owner`;
    }
    return `Hi ${first},\n\nThank you for your honest feedback. I’m sorry we missed the mark on this visit.${tagLine}\n\nHere’s what we’re doing: we’re addressing this with our team right away, and I’d welcome the opportunity to make it right for you.\n\n${snippet ? `You mentioned: “${snippet}${review.text.length > 200 ? "…" : ""}”\n\n` : ""}Please reach out if you’d like to connect directly.\n\nRespectfully,\n— The owner`;
}

const DRAFT_MS = 900;

export function NeedsAttention({
    reviews,
    viewAllHref = "/reviews?status=needs_response&sort=lowest",
    copy: copyProp,
    className,
}: {
    reviews: NeedsAttentionReview[];
    viewAllHref?: string;
    copy?: Partial<NeedsAttentionCopy>;
    className?: string;
}) {
    const copy = useMemo(() => ({ ...DEFAULT_COPY, ...copyProp }), [copyProp]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [sent, setSent] = useState<Record<string, boolean>>({});
    const [generating, setGenerating] = useState<Record<string, boolean>>({});
    const [tones, setTones] = useState<Record<string, ToneKind>>({});
    /** User chose “write your own” before any AI draft exists. */
    const [manualCompose, setManualCompose] = useState<Record<string, boolean>>({});

    const urgentCount = reviews.length;

    const runDraft = useCallback(
        (review: NeedsAttentionReview, toneOverride?: ToneKind) => {
            const id = review.id;
            const kind: ToneKind = toneOverride ?? tones[id] ?? "professional";
            setGenerating((g) => ({ ...g, [id]: true }));
            window.setTimeout(() => {
                const text = buildOwnerDraft(review, kind);
                setDrafts((d) => ({ ...d, [id]: text }));
                setGenerating((g) => ({ ...g, [id]: false }));
            }, DRAFT_MS);
        },
        [tones]
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
                            <p className="text-[11.5px] text-muted-foreground">{copy.subtitle(0)}</p>
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
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border bg-chart-4/25 px-5 py-4 dark:bg-chart-4/15">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <AlertTriangle className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold tracking-tight text-foreground">{copy.title}</p>
                        <p className="truncate text-[11.5px] text-muted-foreground">{copy.subtitle(urgentCount)}</p>
                    </div>
                </div>
                {viewAllHref ? (
                    <Button variant="ghost" size="sm" className="shrink-0 text-[13px]" asChild>
                        <Link href={viewAllHref}>
                            {copy.viewAll}
                        </Link>
                    </Button>
                ) : null}
            </div>

            {/* Rows */}
            <ul className="divide-y divide-border">
                {reviews.map((review) => {
                    const open = expandedId === review.id;
                    const id = review.id;
                    const draft = drafts[id] ?? "";
                    const isGen = !!generating[id];
                    const isSent = !!sent[id];
                    const rating = Math.min(5, Math.max(0, Math.round(review.rating)));
                    const urgency = Math.min(10, Math.max(0, Math.round(review.urgency)));
                    const showUrgency = urgency >= 8;
                    const dateLabel = (() => {
                        try {
                            const d = typeof review.date === "string" ? new Date(review.date) : review.date;
                            return formatDistanceToNow(d, { addSuffix: true });
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
                                <div
                                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-destructive/15 text-[11px] font-bold text-destructive dark:bg-destructive/25 dark:text-destructive-foreground"
                                    aria-hidden
                                >
                                    <span className="font-display tracking-tight">
                                        {initialsFromAuthor(review.author, review.avatar)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[13.5px] font-semibold text-foreground">{review.author}</span>
                                        <span className="inline-flex items-center gap-0.5" aria-label={`${rating} of 5 stars`}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-2.5 w-2.5",
                                                        i < rating
                                                            ? "fill-chart-4 text-chart-4"
                                                            : "fill-muted text-muted"
                                                    )}
                                                    aria-hidden
                                                />
                                            ))}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">· {dateLabel}</span>
                                        {showUrgency ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11.5px] font-semibold tracking-[0.02em] text-destructive dark:bg-destructive/25 dark:text-destructive-foreground">
                                                <Flame className="h-3 w-3" aria-hidden />
                                                {copy.urgencyLabel(urgency)}
                                            </span>
                                        ) : null}
                                        {isSent ? (
                                            <Badge variant="secondary" className="border-chart-2/30 bg-chart-2/15 text-chart-2 dark:bg-chart-2/20">
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
                                                    {tag}
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

                                        {!isGen && !manualCompose[id] && !(id in drafts) ? (
                                            <div className="flex flex-col items-center gap-2 py-2">
                                                <Button
                                                    type="button"
                                                    className="gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        runDraft(review);
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
                                                    <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
                                                    {copy.drafting}
                                                </Button>
                                            </div>
                                        ) : null}

                                        {(manualCompose[id] || id in drafts) && !isGen ? (
                                            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                                <Textarea
                                                    value={draft}
                                                    onChange={(e) => setDrafts((d) => ({ ...d, [id]: e.target.value }))}
                                                    placeholder="Write your reply…"
                                                    className="min-h-[110px] resize-y border-border bg-muted/40 text-[13px] text-foreground"
                                                    readOnly={isSent}
                                                />
                                                {!isSent ? (
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="gap-1 text-muted-foreground"
                                                                onClick={() => runDraft(review)}
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
                                                                        onClick={() => {
                                                                            setTones((t) => ({
                                                                                ...t,
                                                                                [id]: "professional",
                                                                            }));
                                                                            runDraft(review, "professional");
                                                                        }}
                                                                    >
                                                                        {copy.toneProfessional}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setTones((t) => ({
                                                                                ...t,
                                                                                [id]: "warm",
                                                                            }));
                                                                            runDraft(review, "warm");
                                                                        }}
                                                                    >
                                                                        {copy.toneWarm}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setTones((t) => ({
                                                                                ...t,
                                                                                [id]: "brief",
                                                                            }));
                                                                            runDraft(review, "brief");
                                                                        }}
                                                                    >
                                                                        {copy.toneBrief}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            className="gap-2 bg-primary text-primary-foreground hover:brightness-95"
                                                            onClick={() => {
                                                                setSent((s) => ({ ...s, [id]: true }));
                                                                window.setTimeout(() => {
                                                                    setExpandedId(null);
                                                                }, 1200);
                                                            }}
                                                        >
                                                            <Send className="h-4 w-4" aria-hidden />
                                                            {copy.sendReply}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="flex items-center gap-1 text-sm font-medium text-chart-2">
                                                        <Check className="h-4 w-4" aria-hidden />
                                                        {copy.sent}
                                                    </p>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
