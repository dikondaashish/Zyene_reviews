"use client";

import { useState, useCallback } from "react";
import { Star, MessageSquare, MoreHorizontal, CornerDownRight, Sparkles, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils/index";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/settings/upgrade-modal";

interface Review {
    id: string;
    business_id: string;
    author_name: string;
    rating: number;
    content?: string;
    text?: string;
    published_at?: string;
    review_date?: string;
    created_at?: string;
    response_status: 'pending' | 'responded' | 'ignored';
    response_text?: string;
    responded_at?: string;
    platform: string;
    sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    urgency_score?: number;
    themes?: string[];
    selected_staff?: string[] | null;
}

const TONES = ["professional", "friendly", "concise"] as const;
type Tone = typeof TONES[number];

export function ReviewCard({
    review,
    isSelected = false,
    onSelect,
    onRefresh,
}: {
    review: Review;
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

    // AI tone state
    const [activeTone, setActiveTone] = useState<Tone | null>(null);
    const [loadingTone, setLoadingTone] = useState<Tone | null>(null);
    const [toneCache, setToneCache] = useState<Partial<Record<Tone, string>>>({});

    const router = useRouter();

    const handleSubmit = async () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/reply`, {
                method: "POST",
                body: JSON.stringify({ text: replyText }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reply");

            toast.success("Reply posted successfully");
            setIsReplying(false);
            setReplyText("");
            setActiveTone(null);
            setToneCache({});
            onRefresh ? onRefresh() : router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            if (message.includes("Monthly AI reply limit reached") || message.includes("upgrade your plan")) {
                setShowUpgradeModal(true);
            } else {
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToneClick = useCallback(async (tone: Tone) => {
        // If already cached, just switch
        if (toneCache[tone]) {
            setActiveTone(tone);
            setReplyText(toneCache[tone]);
            return;
        }

        if (!isReplying) setIsReplying(true);
        setActiveTone(tone);
        setLoadingTone(tone);

        try {
            const res = await fetch("/api/ai/suggest-reply", {
                method: "POST",
                body: JSON.stringify({ reviewId: review.id, tone }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to get suggestion");

            const payload = json.data || json;
            const reply = payload.reply || "";

            setToneCache((prev) => ({ ...prev, [tone]: reply }));
            setReplyText(reply);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            if (message.includes("Monthly AI reply limit reached") || message.includes("upgrade your plan")) {
                setShowUpgradeModal(true);
            } else {
                toast.error(message);
            }
        } finally {
            setLoadingTone(null);
        }
    }, [isReplying, toneCache, review.id]);

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
            case 'ignored': return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200">Ignored</span>;
            default: return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium border border-yellow-200">Pending</span>;
        }
    };

    const renderStars = (rating: number) => {
        const colorClass = rating >= 4 ? "text-green-500 fill-green-500" : rating === 3 ? "text-yellow-500 fill-yellow-500" : "text-red-500 fill-red-500";
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < rating ? colorClass : "text-gray-200 fill-gray-200")} />
                ))}
            </div>
        );
    };

    const displayContent = review.text || review.content || "";

    return (
        <div className={cn(
            "bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group",
            isSelected && "border-blue-200 bg-blue-50/20 shadow-blue-50"
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
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )}

            <div className={cn("flex justify-between items-start mb-3", onSelect && "pl-7")}>
                <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200">
                        {(review.author_name || "A").charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-gray-900 line-clamp-1">{review.author_name || "Anonymous"}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(review.rating)}
                            {(review.review_date || review.published_at || review.created_at) && (
                                <span className="text-xs text-slate-400">
                                    {new Date(review.review_date || review.published_at || review.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            )}
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wide border border-blue-100">{review.platform || 'Google'}</span>
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
                            review.sentiment === 'neutral' && "bg-gray-50 text-gray-700 border-gray-100",
                            review.sentiment === 'mixed' && "bg-orange-50 text-orange-700 border-orange-100",
                        )}>
                            {review.sentiment}
                        </span>
                    )}
                    {review.id.startsWith("demo-") && (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Demo Data
                        </span>
                    )}
                    {getStatusBadge(review.response_status)}
                </div>
            </div>

            {/* Content & Themes */}
            <div className="space-y-2">
                <div className="text-sm text-slate-600 leading-relaxed">
                    <p className={cn(!isExpanded && "line-clamp-3")}>{displayContent}</p>
                    {displayContent.length > 200 && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-xs font-medium mt-1 hover:underline focus:outline-none">
                            {isExpanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </div>

                {review.themes && review.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {review.themes.map(theme => (
                            <span key={theme} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 capitalize">
                                {theme.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                )}

                {review.selected_staff && review.selected_staff.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Served by:</span>
                        <div className="flex flex-wrap gap-1">
                            {review.selected_staff.map(staff => (
                                <Badge key={staff} variant="secondary" className="px-2 py-0 h-4 text-[9px] bg-blue-50 text-blue-700 border-blue-100 font-medium">
                                    {staff}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Existing Response */}
            {review.response_status === 'responded' && review.response_text && (
                <div className="bg-slate-50 rounded-md p-3 text-sm border-l-2 border-blue-500 ml-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-1">
                        <CornerDownRight className="w-3 h-3 text-slate-400" />
                        Your Response
                        {review.responded_at && (
                            <span className="text-slate-400 font-normal ml-auto text-[10px]">
                                {new Date(review.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-600">{review.response_text}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50 mt-1">
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
                                            className="h-9 text-xs font-semibold px-4 border-slate-200 text-slate-600 hover:bg-slate-50"
                                            onClick={() => {
                                                setIsReplying(false);
                                                setActiveTone(null);
                                                setReplyText("");
                                            }}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                            Cancel Reply
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-9 text-xs font-semibold px-4 bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#7c3aed] border border-[#ddd6fe] shadow-none"
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
                                            className="h-9 text-xs font-semibold px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                            onClick={() => setIsReplying(true)}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                            Reply
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-9 text-xs font-semibold px-4 bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#7c3aed] border border-[#ddd6fe] shadow-none"
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full">
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

            {/* Reply Area with Tone Tabs */}
            {isReplying && review.response_status !== 'responded' && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4 animate-in slide-in-from-top-2 duration-200">

                    {/* Tone Selector Tabs */}
                    {review.platform !== 'yelp' && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-500" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Tone</span>
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
                                                ? "bg-[#f97316] text-white border-[#f97316] shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
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

                    <Textarea
                        placeholder="Write a response or click a tone above for an AI draft..."
                        className="min-h-[120px] mb-4 bg-white text-sm resize-none focus-visible:ring-blue-500 border-slate-200 shadow-sm focus:border-blue-500 placeholder:text-slate-400"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end items-center gap-3">
                        <button
                            onClick={() => { setIsReplying(false); setActiveTone(null); setReplyText(""); }}
                            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !replyText.trim()}
                            className="bg-[#93c5fd] hover:bg-blue-400 text-white shadow-none px-6 font-semibold rounded-lg"
                        >
                            {isSubmitting ? "Posting..." : "Post Reply"}
                        </Button>
                    </div>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Upgrade Your Plan"
                description="You've reached your monthly AI reply limit. Please upgrade your plan to continue using AI features."
            />
        </div>
    );
}
