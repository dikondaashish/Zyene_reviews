"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Star, MessageSquare, MoreHorizontal, CornerDownRight, Sparkles, AlertTriangle, Zap, Loader2, ImageIcon, Info, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    REVIEW_RESPONSE_SOURCE_ZYENE,
    REVIEW_RESPONSE_SOURCE_ZYENE_AUTO,
} from "@/lib/reviews/response-source";

interface Review {
    id: string;
    business_id: string;
    author_name: string;
    /** Google/Yelp profile image when the platform provides one */
    author_avatar_url?: string | null;
    rating: number;
    content?: string;
    text?: string;
    published_at?: string;
    review_date?: string;
    created_at?: string;
    response_status: 'pending' | 'responded' | 'ignored';
    response_text?: string;
    responded_at?: string;
    /** zyene = manual from app; zyene_auto = Auto commenter; google = replied on GBP */
    response_source?: string | null;
    platform: string;
    review_photo_urls?: string[] | null;
    google_attribute_chips?: string[] | null;
    google_place_context?: string[] | null;
    sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    urgency_score?: number;
    themes?: string[];
    selected_staff?: string[] | null;
}

const TONES = ["professional", "friendly", "concise"] as const;
type Tone = typeof TONES[number];

export function ReviewCard({
    review,
    googleMapsListingUrl = null,
    planAllowsAiReplies = true,
    isSelected = false,
    onSelect,
    onRefresh,
}: {
    review: Review;
    /** Business listing on Google Maps (from GBP link); used when review photos are not in the API. */
    googleMapsListingUrl?: string | null;
    /** Starter+ / Professional / Enterprise — required for AI suggest-reply */
    planAllowsAiReplies?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    onRefresh?: () => void;
}) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeModalKind, setUpgradeModalKind] = useState<"limit" | "plan">("limit");
    const [detailOpen, setDetailOpen] = useState(false);
    const [activePhoto, setActivePhoto] = useState<string | null>(null);
    const [isEditingReply, setIsEditingReply] = useState(false);
    const [deleteReplyOpen, setDeleteReplyOpen] = useState(false);
    const [isDeletingReply, setIsDeletingReply] = useState(false);

    // AI tone state
    const [activeTone, setActiveTone] = useState<Tone | null>(null);
    const [loadingTone, setLoadingTone] = useState<Tone | null>(null);
    const [toneCache, setToneCache] = useState<Partial<Record<Tone, string>>>({});
    const [isAiTyping, setIsAiTyping] = useState(false);
    const aiStreamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const router = useRouter();

    const stopAiStream = useCallback(() => {
        if (aiStreamIntervalRef.current !== null) {
            clearInterval(aiStreamIntervalRef.current);
            aiStreamIntervalRef.current = null;
        }
        setIsAiTyping(false);
    }, []);

    const startAiStream = useCallback(
        (full: string) => {
            stopAiStream();
            if (!full) {
                setReplyText("");
                return;
            }
            setReplyText("");
            setIsAiTyping(true);
            let i = 0;
            const charsPerTick = 2;
            const intervalMs = 14;
            aiStreamIntervalRef.current = setInterval(() => {
                i = Math.min(i + charsPerTick, full.length);
                setReplyText(full.slice(0, i));
                if (i >= full.length) {
                    if (aiStreamIntervalRef.current !== null) {
                        clearInterval(aiStreamIntervalRef.current);
                        aiStreamIntervalRef.current = null;
                    }
                    setIsAiTyping(false);
                }
            }, intervalMs);
        },
        [stopAiStream]
    );

    useEffect(() => () => stopAiStream(), [stopAiStream]);

    const showReplyComposer =
        (isReplying && review.response_status !== "responded") || isEditingReply;

    const canManageGoogleReply =
        review.platform === "google" &&
        review.response_status === "responded" &&
        !!(review.response_text && review.response_text.trim());

    const handleSubmit = async () => {
        if (!replyText.trim()) return;
        stopAiStream();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/reply`, {
                method: "POST",
                body: JSON.stringify({ text: replyText }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reply");

            toast.success(isEditingReply ? "Reply updated" : "Reply posted successfully");
            setIsReplying(false);
            setIsEditingReply(false);
            setReplyText("");
            setActiveTone(null);
            setToneCache({});
            onRefresh ? onRefresh() : router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            if (message.includes("Monthly AI reply limit reached") || message.includes("upgrade your plan")) {
                setUpgradeModalKind("limit");
                setShowUpgradeModal(true);
            } else {
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplyTextChange = useCallback(
        (value: string) => {
            if (isAiTyping) stopAiStream();
            setReplyText(value);
        },
        [isAiTyping, stopAiStream]
    );

    const handleToneClick = useCallback(async (tone: Tone) => {
        stopAiStream();

        if (!planAllowsAiReplies) {
            setUpgradeModalKind("plan");
            setShowUpgradeModal(true);
            return;
        }

        // If already cached, just switch (instant — no re-type)
        if (toneCache[tone]) {
            setActiveTone(tone);
            setReplyText(toneCache[tone]!);
            return;
        }

        if (!isReplying && !isEditingReply) setIsReplying(true);
        setActiveTone(tone);
        setLoadingTone(tone);

        try {
            const res = await fetch("/api/ai/suggest-reply", {
                method: "POST",
                body: JSON.stringify({ reviewId: review.id, tone }),
            });
            const json = await res.json();
            if (!res.ok) {
                if (json?.code === "AI_REPLY_PLAN_REQUIRED") {
                    setUpgradeModalKind("plan");
                    setShowUpgradeModal(true);
                    return;
                }
                throw new Error(json.error || "Failed to get suggestion");
            }

            const payload = json.data || json;
            const reply = payload.reply || "";

            setToneCache((prev) => ({ ...prev, [tone]: reply }));
            setLoadingTone(null);
            startAiStream(reply);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            if (message.includes("Monthly AI reply limit reached") || message.includes("upgrade your plan")) {
                setUpgradeModalKind("limit");
                setShowUpgradeModal(true);
            } else {
                toast.error(message);
            }
        } finally {
            setLoadingTone(null);
        }
    }, [
        planAllowsAiReplies,
        isReplying,
        isEditingReply,
        toneCache,
        review.id,
        stopAiStream,
        startAiStream,
    ]);

    const startEditReply = useCallback(() => {
        stopAiStream();
        setIsEditingReply(true);
        setReplyText(review.response_text || "");
        setActiveTone(null);
        setToneCache({});
    }, [review.response_text, stopAiStream]);

    const cancelReplyComposer = useCallback(() => {
        stopAiStream();
        setIsReplying(false);
        setIsEditingReply(false);
        setReplyText("");
        setActiveTone(null);
        setToneCache({});
    }, [stopAiStream]);

    const handleDeleteReply = async () => {
        setIsDeletingReply(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/reply`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to delete reply");
            toast.success("Reply removed");
            setDeleteReplyOpen(false);
            onRefresh ? onRefresh() : router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsDeletingReply(false);
        }
    };

    const handleUpdateStatus = async (status: 'pending' | 'ignored') => {
        setIsUpdatingStatus(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            toast.success(`Review ${status === 'ignored' ? 'ignored' : 'moved to pending'}`);
            onRefresh ? onRefresh() : router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'responded': return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">Responded</span>;
            case 'ignored': return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border">Ignored</span>;
            default: return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium border border-yellow-200">Pending</span>;
        }
    };

    const renderStars = (rating: number) => {
        const colorClass = rating >= 4 ? "text-green-500 fill-green-500" : rating === 3 ? "text-yellow-500 fill-yellow-500" : "text-red-500 fill-red-500";
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < rating ? colorClass : "text-muted-foreground/40 fill-muted")} />
                ))}
            </div>
        );
    };

    const displayContent = review.text || review.content || "";
    const avatarUrl =
        typeof review.author_avatar_url === "string" && review.author_avatar_url.trim()
            ? review.author_avatar_url.trim()
            : null;
    const authorInitial = (review.author_name || "A").charAt(0);
    const googlePhotos = (review.review_photo_urls || []).filter(Boolean);
    const googleAttributeChips = (review.google_attribute_chips || []).filter(Boolean);
    const googlePlaceContext = (review.google_place_context || []).filter(Boolean);
    const googleMapsHref =
        review.platform === "google" &&
        typeof googleMapsListingUrl === "string" &&
        googleMapsListingUrl.trim().length > 0
            ? googleMapsListingUrl.trim()
            : null;

    return (
        <div className={cn(
            "bg-card rounded-xl border border-border p-4 transition-all duration-300 relative group",
            isSelected && "border-primary/30 bg-primary/10"
        )}>
            {/* Selection Checkbox */}
            {onSelect && (
                <div className={cn(
                    "absolute left-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity",
                    isSelected && "opacity-100"
                )}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(review.id, e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                </div>
            )}

            <div className={cn("flex justify-between items-start mb-3", onSelect && "pl-7")}>
                <div className="flex gap-3">
                    <Avatar
                        size="lg"
                        className="h-10 w-10 shrink-0 border border-border"
                    >
                        {avatarUrl ? (
                            <AvatarImage
                                src={avatarUrl}
                                alt={review.author_name || "Reviewer"}
                                referrerPolicy="no-referrer"
                            />
                        ) : null}
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">
                            {authorInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-sm text-foreground line-clamp-1">{review.author_name || "Anonymous"}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(review.rating)}
                            {(review.review_date || review.published_at || review.created_at) && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(review.review_date || review.published_at || review.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            )}
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wide border border-primary/20">{review.platform || 'Google'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {review.urgency_score && review.urgency_score >= 7 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">
                            <Zap className="w-3 h-3 fill-red-600" />
                            URGENT
                        </span>
                    )}
                    {review.sentiment && (
                        <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize",
                            review.sentiment === 'positive' && "bg-green-50 text-green-700 border-green-100",
                            review.sentiment === 'negative' && "bg-red-50 text-red-700 border-red-100",
                            review.sentiment === 'neutral' && "bg-muted text-muted-foreground border-border",
                            review.sentiment === 'mixed' && "bg-primary/10 text-primary border-primary/20",
                        )}>
                            {review.sentiment}
                        </span>
                    )}
                    {review.id.startsWith("demo-") && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Demo Data
                        </span>
                    )}
                    {getStatusBadge(review.response_status)}
                </div>
            </div>

            {/* Content & Themes */}
            <div className="space-y-2">
                <div className="text-sm text-muted-foreground leading-relaxed">
                    <p className={cn(!isExpanded && "line-clamp-3")}>{displayContent}</p>
                    {displayContent.length > 200 && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary text-xs font-medium mt-1 hover:underline focus:outline-none">
                            {isExpanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </div>

                {review.themes && review.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                        {review.themes.map(theme => (
                            <span key={theme} className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border capitalize">
                                {theme.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                )}

                {googlePlaceContext.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {googlePlaceContext.map((ctx) => (
                            <Badge
                                key={`ctx-${ctx}`}
                                variant="secondary"
                                className="px-2 py-0.5 h-5 text-[10px] bg-cyan-50 text-cyan-800 border-cyan-200 font-medium"
                            >
                                {ctx}
                            </Badge>
                        ))}
                    </div>
                )}

                {googleAttributeChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {googleAttributeChips.map((chip) => (
                            <Badge
                                key={`google-chip-${chip}`}
                                variant="secondary"
                                className="px-2 py-0.5 h-5 text-[10px] bg-indigo-50 text-indigo-800 border-indigo-200 font-medium"
                            >
                                {chip}
                            </Badge>
                        ))}
                    </div>
                )}

                {googlePhotos.length > 0 && (
                    <div className="pt-2">
                        <div className="flex items-center gap-1.5 mb-2">
                            <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Review Photos
                            </span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {googlePhotos.slice(0, 6).map((url, idx) => (
                                <button
                                    key={`${url}-${idx}`}
                                    type="button"
                                    onClick={() => setActivePhoto(url)}
                                    className="h-16 w-16 shrink-0 rounded-md border border-border overflow-hidden hover:opacity-90"
                                    title="Open photo"
                                >
                                    <img
                                        src={url}
                                        alt={`Review photo ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {review.selected_staff && review.selected_staff.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Served by:</span>
                        <div className="flex flex-wrap gap-1">
                            {review.selected_staff.map(staff => (
                                <Badge key={staff} variant="secondary" className="px-2 py-0 h-4 text-[9px] bg-primary/10 text-primary border-primary/20 font-medium">
                                    {staff}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Existing Response */}
            {review.response_status === 'responded' && review.response_text && !isEditingReply && (
                <div className="mt-5 bg-muted rounded-md p-3 text-sm border-l-2 border-primary ml-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground min-w-0">
                            <CornerDownRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="font-semibold shrink-0">Your Response</span>
                            {review.responded_at && (
                                <time
                                    dateTime={review.responded_at}
                                    className="text-muted-foreground font-normal text-[10px] tabular-nums shrink-0"
                                >
                                    {new Date(review.responded_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </time>
                            )}
                            {review.response_source === REVIEW_RESPONSE_SOURCE_ZYENE && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 px-2 text-[10px] font-medium bg-violet-50 text-violet-800 border-violet-200"
                                >
                                    Replied via Zyene Reviews
                                </Badge>
                            )}
                            {review.response_source === REVIEW_RESPONSE_SOURCE_ZYENE_AUTO && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 px-2 text-[10px] font-medium bg-indigo-50 text-indigo-900 border-indigo-200"
                                >
                                    AI auto commenter · Zyene Reviews
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {canManageGoogleReply && (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={startEditReply}
                                    >
                                        <Pencil className="w-3 h-3 mr-1" />
                                        Edit reply
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => setDeleteReplyOpen(true)}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-muted-foreground">{review.response_text}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border mt-1">
                {review.response_status !== 'responded' && (
                    <div className="flex items-center gap-2">
                        {review.platform === 'yelp' ? (
                            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>
                                    Replies to Yelp reviews must be made on{" "}
                                    <a
                                        href="https://biz.yelp.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium underline hover:text-amber-900"
                                    >
                                        yelp.com
                                    </a>
                                </span>
                            </div>
                        ) : (
                            <>
                                {isReplying ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 text-xs font-semibold px-4 border-border text-muted-foreground hover:bg-muted"
                                            onClick={cancelReplyComposer}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                            Cancel Reply
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-9 text-xs font-semibold px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                            onClick={() => !activeTone && handleToneClick("professional")}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                                            AI Suggest Reply
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="h-9 text-xs font-semibold px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                                            onClick={() => setIsReplying(true)}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                            Reply
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-9 text-xs font-semibold px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                            onClick={() => handleToneClick("professional")}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                                            AI Suggest Reply
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div className="ml-auto">
                    <div className="flex items-center gap-1">
                        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <Info className="w-3.5 h-3.5 mr-1" />
                                    Details
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Review details</DialogTitle>
                                    <DialogDescription>
                                        Google metadata synced from Business Profile. Customer
                                        photos only appear here when Google returns image URLs in
                                        the review payload (often it does not).
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {displayContent || "No review text."}
                                    </div>
                                    {googlePlaceContext.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Place context
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {googlePlaceContext.map((ctx) => (
                                                    <Badge key={`drawer-ctx-${ctx}`} variant="secondary">
                                                        {ctx}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {googleAttributeChips.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Google attributes
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {googleAttributeChips.map((chip) => (
                                                    <Badge key={`drawer-chip-${chip}`} variant="secondary">
                                                        {chip}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {googlePhotos.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Photos
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {googlePhotos.map((url, idx) => (
                                                    <button
                                                        key={`drawer-photo-${url}-${idx}`}
                                                        type="button"
                                                        onClick={() => setActivePhoto(url)}
                                                        className="rounded-md overflow-hidden border border-border"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Review photo ${idx + 1}`}
                                                            className="h-28 w-full object-cover"
                                                            referrerPolicy="no-referrer"
                                                            loading="lazy"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {googleMapsHref && (
                                        <div className="rounded-lg border border-border bg-muted/90 px-3 py-2.5 text-sm text-muted-foreground">
                                            <a
                                                href={googleMapsHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                                                Open listing on Google Maps
                                            </a>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Customer photos attached to reviews usually appear there, not in this app.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {review.response_status === 'ignored' ? (
                                    <DropdownMenuItem
                                        className="text-xs cursor-pointer"
                                        onClick={() => handleUpdateStatus('pending')}
                                        disabled={isUpdatingStatus}
                                    >
                                        Move to Pending
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="text-xs cursor-pointer"
                                        onClick={() => handleUpdateStatus('ignored')}
                                        disabled={isUpdatingStatus}
                                    >
                                        Mark as Ignored
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-xs text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">Report Review</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Reply Area with Tone Tabs */}
            {showReplyComposer && (
                <div className="bg-muted p-5 rounded-xl border border-border mt-4 animate-in slide-in-from-top-2 duration-200">
                    {isEditingReply && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Edit reply
                        </p>
                    )}

                    {/* Tone Selector Tabs */}
                    {review.platform !== 'yelp' && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-500" />
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AI Tone</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {TONES.map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => handleToneClick(tone)}
                                        disabled={loadingTone !== null}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-xs font-semibold transition-all border capitalize",
                                            activeTone === tone
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:bg-muted",
                                            loadingTone !== null && loadingTone !== tone && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {loadingTone === tone ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                {tone}
                                            </span>
                                        ) : (
                                            tone
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="relative mb-4">
                        <Textarea
                            placeholder="Write a response or click a tone above for an AI draft..."
                            className={cn(
                                "min-h-[120px] bg-background text-sm resize-none focus-visible:ring-primary border-border focus:border-primary placeholder:text-muted-foreground",
                                isAiTyping && "border-violet-200 ring-1 ring-violet-100"
                            )}
                            value={replyText}
                            onChange={(e) => handleReplyTextChange(e.target.value)}
                            aria-busy={isAiTyping}
                            autoFocus
                        />
                        {isAiTyping && (
                            <span
                                className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 border border-violet-100"
                                aria-live="polite"
                            >
                                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
                                Writing
                            </span>
                        )}
                    </div>
                    <div className="flex justify-end items-center gap-3">
                        <button
                            type="button"
                            onClick={cancelReplyComposer}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !replyText.trim()}
                            className={cn(
                                "min-w-[7.5rem] px-6 font-semibold rounded-lg",
                                "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
                                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                "disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground disabled:hover:bg-muted"
                            )}
                        >
                            {isSubmitting
                                ? isEditingReply
                                    ? "Saving..."
                                    : "Posting..."
                                : isEditingReply
                                  ? "Update reply"
                                  : "Post Reply"}
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog open={deleteReplyOpen} onOpenChange={setDeleteReplyOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes your public reply from Google Business Profile. You can write a new reply
                            afterward.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingReply}>Cancel</AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeletingReply}
                            onClick={() => void handleDeleteReply()}
                        >
                            {isDeletingReply ? "Deleting..." : "Delete reply"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title={
                    upgradeModalKind === "plan"
                        ? "Upgrade for AI reply suggestions"
                        : "Upgrade Your Plan"
                }
                description={
                    upgradeModalKind === "plan"
                        ? "AI-assisted replies are available on Starter, Professional, and Enterprise. Choose a plan to continue."
                        : "You've reached your monthly AI reply limit. Please upgrade your plan to continue using AI features."
                }
            />
            <Dialog open={!!activePhoto} onOpenChange={(open) => !open && setActivePhoto(null)}>
                <DialogContent className="sm:max-w-4xl p-2">
                    {activePhoto ? (
                        <img
                            src={activePhoto}
                            alt="Review media"
                            className="w-full max-h-[80vh] object-contain rounded-md"
                            referrerPolicy="no-referrer"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
