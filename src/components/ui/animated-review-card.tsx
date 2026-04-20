"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cva } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Heart,
    MoreHorizontal,
    Reply,
    Star,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MAX_STACK = 15;

export interface SpotlightReview {
    id: number | string;
    name: string;
    avatar: string;
    text: string;
    rating: number;
    reviewedAt?: string | null;
    platform?: string | null;
    sentiment?: string | null;
}

type ThemeColor = "default" | "primary" | "elegant" | "vibrant" | "minimal";

export interface SpotlightLabels {
    hint: string;
    prev: string;
    next: string;
    viewInReviews: string;
}

interface AnimatedReviewCardsProps {
    reviews?: SpotlightReview[];
    interactionType?: "drag" | "click";
    animationDuration?: number;
    scaleStep?: number;
    verticalSpacing?: number;
    horizontalSpacing?: number;
    autoRotate?: boolean;
    rotateInterval?: number;
    theme?: ThemeColor;
    showBorderBeam?: boolean;
    labels?: SpotlightLabels;
    /** When set, wraps the carousel in a dashboard-style panel with title, subtitle, and top-right arrows + counter. */
    shellTitle?: string;
    shellSubtitle?: string;
    manageAllHref?: string;
    manageAllLabel?: string;
    classNames?: {
        container?: string;
        card?: string;
        cardContent?: string;
        header?: string;
        avatar?: string;
        name?: string;
        text?: string;
        rating?: string;
        star?: string;
        activeStarColor?: string;
        inactiveStarColor?: string;
    };
}

const cardVariants = cva(
    "col-start-1 row-start-1 w-full max-w-xl justify-self-center overflow-hidden rounded-xl border border-border bg-background shadow-sm",
    {
        variants: {
            theme: {
                default: "border-border bg-background",
                primary: "bg-primary/5 border border-primary/20",
                elegant:
                    "border border-border bg-muted/60 text-foreground dark:bg-muted/40 dark:text-foreground",
                vibrant:
                    "border border-chart-1/40 bg-gradient-to-br from-chart-1 via-sync-action to-chart-5 text-primary-foreground dark:border-chart-1/30",
                minimal:
                    "border border-border bg-muted text-foreground dark:border-border dark:bg-muted dark:text-foreground",
            },
            cursor: {
                drag: "cursor-grab active:cursor-grabbing",
                click: "cursor-pointer",
            },
        },
    }
);

const nameVariants = cva("text-base font-semibold leading-tight", {
    variants: {
        theme: {
            default: "text-foreground",
            primary: "text-primary",
            secondary: "text-secondary",
            elegant: "text-foreground",
            vibrant: "text-primary-foreground",
            minimal: "text-foreground dark:text-foreground",
        },
    },
});

const textVariants = cva("text-start text-sm leading-relaxed text-foreground/90", {
    variants: {
        theme: {
            default: "",
            primary: "text-primary/90",
            elegant: "text-muted-foreground",
            vibrant: "text-primary-foreground/95",
            minimal: "text-muted-foreground dark:text-muted-foreground",
        },
    },
});

const starColorVariants = {
    default: {
        active: "text-chart-4 fill-current",
        inactive: "text-muted stroke-muted-foreground/20",
    },
    primary: {
        active: "text-primary",
        inactive: "text-primary/20",
    },
    elegant: {
        active: "text-foreground fill-current",
        inactive: "text-muted-foreground/50",
    },
    vibrant: {
        active: "text-primary-foreground fill-current",
        inactive: "text-primary-foreground/40",
    },
    minimal: {
        active: "text-foreground dark:text-foreground fill-current",
        inactive: "text-muted-foreground/40 dark:text-muted-foreground/60",
    },
};

function spotlightInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    const one = parts[0] || "?";
    return one.slice(0, 2).toUpperCase();
}

function SpotlightRatingStars({ rating, className }: { rating: number; className?: string }) {
    const r = Math.min(5, Math.max(0, Math.round(rating)));
    return (
        <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${r} of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    strokeWidth={i < r ? 0 : 1.35}
                    className={cn(
                        "h-3.5 w-3.5 shrink-0 text-chart-4 sm:h-4 sm:w-4",
                        i < r ? "fill-chart-4" : "fill-none"
                    )}
                    aria-hidden
                />
            ))}
        </span>
    );
}

function PlatformBadge({ platform, theme }: { platform: string; theme: ThemeColor }) {
    const p = platform.toLowerCase();
    const label =
        p === "google"
            ? "Google"
            : p === "yelp"
              ? "Yelp"
              : p === "facebook"
                ? "Facebook"
                : p === "zyene"
                  ? "Zyene"
                  : platform;
    const subtle =
        theme === "vibrant"
            ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
            : p === "google"
              ? "border-amber-200/70 bg-amber-100/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
              : "border-border/80 bg-muted/80 text-foreground/80 dark:bg-muted/60";
    return (
        <Badge variant="outline" className={cn("h-5 shrink-0 rounded-full px-2.5 py-0 text-[11px] font-medium", subtle)}>
            {label}
        </Badge>
    );
}

function SentimentPill({ sentiment, theme }: { sentiment: string; theme: ThemeColor }) {
    const s = sentiment.toLowerCase();
    const colors =
        s === "positive"
            ? theme === "vibrant"
                ? "bg-chart-2/30 text-primary-foreground"
                : "bg-chart-2/15 text-chart-2 dark:text-chart-2"
            : s === "negative"
              ? theme === "vibrant"
                  ? "bg-destructive/30 text-destructive-foreground"
                  : "bg-destructive/15 text-destructive dark:text-destructive"
                : s === "mixed"
                ? theme === "vibrant"
                    ? "bg-chart-4/30 text-foreground"
                    : "bg-chart-4/15 text-chart-4 dark:text-chart-4"
                : theme === "vibrant"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground";
    return (
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", colors)}>
            {sentiment}
        </span>
    );
}

export const AnimatedReviewCards = ({
    reviews: initialReviewsProp = [],
    interactionType = "drag",
    animationDuration = 0.3,
    scaleStep = 0.05,
    verticalSpacing = 10,
    horizontalSpacing: _horizontalSpacing = 20,
    autoRotate = true,
    rotateInterval = 8000,
    theme = "default",
    classNames,
    labels,
    shellTitle,
    shellSubtitle,
    manageAllHref,
    manageAllLabel,
}: AnimatedReviewCardsProps) => {
    const reduceMotion = useReducedMotion();
    const effectiveDuration = reduceMotion ? 0 : animationDuration;
    const effectiveAutoRotate = autoRotate && !reduceMotion;

    const starColors = starColorVariants[theme];
    const [reviews, setReviews] = useState<SpotlightReview[]>(() => initialReviewsProp.slice(0, MAX_STACK));
    const [isInteracting, setIsInteracting] = useState(false);
    const [hoverPause, setHoverPause] = useState(false);
    const [focusWithin, setFocusWithin] = useState(false);

    const stableOrderRef = useRef<string[]>([]);

    useEffect(() => {
        const next = initialReviewsProp.slice(0, MAX_STACK);
        setReviews(next);
        const ids = next.map((r) => String(r.id));
        if (ids.join("|") !== stableOrderRef.current.join("|")) {
            stableOrderRef.current = ids;
        }
    }, [initialReviewsProp]);

    const pauseRotation = hoverPause || focusWithin || isInteracting;

    const rotateForward = useCallback(() => {
        setReviews((prev) => {
            if (prev.length < 2) return prev;
            const next = [...prev];
            const [first] = next.splice(0, 1);
            next.push(first);
            return next;
        });
    }, []);

    const rotateBackward = useCallback(() => {
        setReviews((prev) => {
            if (prev.length < 2) return prev;
            const next = [...prev];
            const last = next.pop()!;
            next.unshift(last);
            return next;
        });
    }, []);

    const handleInteraction = (index: number) => {
        setReviews((prevReviews) => {
            if (index < 0 || index >= prevReviews.length) return prevReviews;
            const newReviews = [...prevReviews];
            const [removed] = newReviews.splice(index, 1);
            newReviews.push(removed);
            return newReviews;
        });
    };

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (effectiveAutoRotate && !pauseRotation && reviews.length > 1) {
            intervalId = setInterval(() => {
                rotateForward();
            }, rotateInterval);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [effectiveAutoRotate, rotateInterval, pauseRotation, reviews.length, rotateForward]);

    const rawActiveIndex =
        reviews[0] && stableOrderRef.current.length > 0
            ? stableOrderRef.current.findIndex((id) => id === String(reviews[0].id))
            : 0;
    const activeDotIndex = rawActiveIndex < 0 ? 0 : rawActiveIndex;
    const orderLen = stableOrderRef.current.length || reviews.length || 1;
    const counterCurrent = reviews.length ? Math.min(activeDotIndex + 1, orderLen) : 0;

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            rotateForward();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            rotateBackward();
        }
    };

    const showShell = Boolean(shellTitle);
    const navDisabled = reviews.length < 2;

    /** Centered deck: back cards sit slightly below and smaller so edges peek without horizontal overflow. */
    const deckYOffset = Math.min(9, Math.max(5, Math.round(verticalSpacing * 0.65)));
    const deckScaleStep = scaleStep > 0 && scaleStep < 0.1 ? scaleStep : 0.028;

    const carouselRegion = (
        <div
            className={cn(
                "relative mx-auto w-full overflow-hidden rounded-xl px-1 sm:px-2",
                showShell ? "min-h-[300px] pb-2 pt-1 sm:min-h-[310px]" : "min-h-[360px] pb-2 pt-2 sm:min-h-[380px]"
            )}
            onMouseEnter={() => setHoverPause(true)}
            onMouseLeave={() => setHoverPause(false)}
            onFocusCapture={() => setFocusWithin(true)}
            onBlurCapture={() => setFocusWithin(false)}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={shellTitle || "Review spotlight"}
            aria-live="polite"
        >
            <div className="grid w-full grid-cols-1 grid-rows-1 justify-items-center">
                <AnimatePresence>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={String(review.id)}
                            initial={reduceMotion ? false : { scale: 0.92, y: 24, opacity: 0 }}
                            animate={{
                                scale: Math.max(0.86, 1 - index * deckScaleStep),
                                y: index * deckYOffset,
                                x: 0,
                                opacity: Math.max(0.35, 1 - index * 0.14),
                                zIndex: reviews.length - index,
                            }}
                            exit={reduceMotion ? undefined : { scale: 0.92, y: 24, opacity: 0 }}
                            transition={{ duration: effectiveDuration }}
                            drag={interactionType === "drag" && !reduceMotion && index === 0 ? "y" : false}
                            dragConstraints={
                                interactionType === "drag" && !reduceMotion && index === 0
                                    ? { top: 0, bottom: 0 }
                                    : undefined
                            }
                            onDragStart={() => setIsInteracting(true)}
                            onDragEnd={() => {
                                setIsInteracting(false);
                                if (interactionType === "drag" && index === 0) handleInteraction(index);
                            }}
                            onClick={() => {
                                if (interactionType === "click" && index === 0) {
                                    setIsInteracting(true);
                                    handleInteraction(index);
                                    setTimeout(() => setIsInteracting(false), 300);
                                }
                            }}
                            title={
                                interactionType === "drag"
                                    ? "Drag to see the next review"
                                    : "Click for next review"
                            }
                            className={cn(
                                cardVariants({
                                    theme,
                                    cursor: interactionType,
                                    className: classNames?.card,
                                }),
                                "h-[min(280px,58vh)] min-h-[220px] sm:h-[260px] sm:min-h-[240px] md:h-[252px]",
                                index > 0 && "cursor-default"
                            )}
                        >
                        <div
                            className={cn(
                                "flex h-full min-h-0 flex-col p-5 md:p-6",
                                classNames?.cardContent
                            )}
                        >
                            {index === 0 ? (
                                <div className={cn("mb-3 flex min-h-0 items-start justify-between gap-2", classNames?.header)}>
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        <Avatar className={cn("h-10 w-10 shrink-0 ring-1 ring-border", classNames?.avatar)}>
                                            {review?.avatar ? (
                                                <AvatarImage
                                                    src={review.avatar}
                                                    alt={review.name}
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : null}
                                            <AvatarFallback
                                                className={cn(
                                                    "text-xs font-semibold",
                                                    theme === "default"
                                                        ? "bg-chart-4/25 text-chart-4"
                                                        : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {spotlightInitials(review?.name || "")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2
                                                    className={nameVariants({
                                                        theme,
                                                        className: cn("truncate text-[15px]", classNames?.name),
                                                    })}
                                                >
                                                    {review?.name}
                                                </h2>
                                                {review.platform ? (
                                                    <PlatformBadge platform={review.platform} theme={theme} />
                                                ) : null}
                                                {review.sentiment && theme !== "default" ? (
                                                    <SentimentPill sentiment={review.sentiment} theme={theme} />
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {theme === "default" ? (
                                                    <SpotlightRatingStars rating={review.rating ?? 0} />
                                                ) : (
                                                    <span className={cn("flex items-center gap-0.5", classNames?.rating)}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "h-4 w-4 md:h-5 md:w-5",
                                                                    i < (review?.rating ?? 0)
                                                                        ? classNames?.activeStarColor || starColors.active
                                                                        : classNames?.inactiveStarColor ||
                                                                          starColors.inactive,
                                                                    classNames?.star
                                                                )}
                                                            />
                                                        ))}
                                                    </span>
                                                )}
                                                {review.reviewedAt ? (
                                                    <time
                                                        className="text-xs text-muted-foreground"
                                                        dateTime={review.reviewedAt}
                                                    >
                                                        {formatDistanceToNow(new Date(review.reviewedAt), {
                                                            addSuffix: true,
                                                        })}
                                                    </time>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    {labels ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 text-muted-foreground"
                                                    aria-label="Review actions"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href="/reviews">{labels.viewInReviews}</Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : null}
                                </div>
                            ) : (
                                <div className={cn("mb-2 flex min-h-0 items-start gap-2", classNames?.header)}>
                                    <Avatar className={cn("h-8 w-8 shrink-0", classNames?.avatar)}>
                                        {review?.avatar ? (
                                            <AvatarImage
                                                src={review.avatar}
                                                alt={review.name}
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : null}
                                        <AvatarFallback className="text-[10px] font-medium">
                                            {review?.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2
                                        className={nameVariants({
                                            theme,
                                            className: cn("truncate text-sm", classNames?.name),
                                        })}
                                    >
                                        {review?.name}
                                    </h2>
                                </div>
                            )}

                            <p
                                className={cn(
                                    "min-h-0 flex-1 overflow-hidden text-sm leading-relaxed",
                                    index === 0 ? "line-clamp-5" : "line-clamp-3",
                                    textVariants({ theme, className: classNames?.text })
                                )}
                            >
                                {review?.text}
                            </p>

                            {index === 0 && theme === "default" && labels ? (
                                <div className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-border/50 pt-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href="/reviews"
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                                        >
                                            <Reply className="h-3.5 w-3.5" aria-hidden />
                                            Reply
                                        </Link>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                toast.message("Open Reviews to thank customers or follow up.")
                                            }
                                        >
                                            <Heart className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                                            Thank
                                        </Button>
                                    </div>
                                    <Link
                                        href="/reviews"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Open
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                                    </Link>
                                </div>
                            ) : index === 0 && labels ? (
                                <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-border/40 pt-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className={cn("flex items-center gap-0.5", classNames?.rating)}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-4 w-4 md:h-5 md:w-5",
                                                        i < (review?.rating ?? 0)
                                                            ? classNames?.activeStarColor || starColors.active
                                                            : classNames?.inactiveStarColor || starColors.inactive,
                                                        classNames?.star
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <Link
                                            href="/reviews"
                                            className="text-xs font-semibold text-primary hover:underline"
                                        >
                                            {labels.viewInReviews}
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );

    const pagination = labels && stableOrderRef.current.length > 0 && (
        <div className="mt-4 flex w-full justify-center px-2">
            <div
                className="flex max-w-full flex-wrap items-center justify-center gap-1.5"
                role="tablist"
                aria-label="Review position"
            >
                {stableOrderRef.current.map((id, i) => (
                    <span
                        key={id}
                        role="presentation"
                        className={cn(
                            "rounded-full transition-all duration-200",
                            i === activeDotIndex
                                ? "h-2 w-6 bg-foreground/80"
                                : "h-2 w-2 bg-muted-foreground/25"
                        )}
                    />
                ))}
            </div>
        </div>
    );

    const bottomHint =
        !showShell && labels ? (
            <p className="mt-3 max-w-md px-2 text-center text-xs text-muted-foreground">{labels.hint}</p>
        ) : null;

    const topNav =
        showShell && labels ? (
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={labels.prev}
                    disabled={navDisabled}
                    onClick={() => rotateBackward()}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[2.75rem] text-center text-xs tabular-nums text-muted-foreground">
                    {counterCurrent} / {orderLen}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={labels.next}
                    disabled={navDisabled}
                    onClick={() => rotateForward()}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        ) : null;

    const body = (
        <>
            {carouselRegion}
            {pagination}
            {bottomHint}
        </>
    );

    return (
        <div className={cn("not-prose relative w-full h-full", classNames?.container)}>
            {showShell ? (
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <div className="mb-1 flex shrink-0 flex-col gap-3 border-b border-border/60 pb-4 sm:mb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">{shellTitle}</h2>
                            {shellSubtitle ? (
                                <p className="text-sm leading-snug text-muted-foreground">{shellSubtitle}</p>
                            ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                            {topNav}
                            {manageAllHref && manageAllLabel ? (
                                <Link
                                    href={manageAllHref}
                                    className="text-xs font-medium text-primary hover:underline sm:text-right"
                                >
                                    {manageAllLabel}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <div className="pt-2 flex-1">{body}</div>
                </div>
            ) : (
                <div className="flex flex-col h-full w-full items-center">{body}</div>
            )}
        </div>
    );
};
