"use client";

import { formatDistanceToNow } from "date-fns";
import { Star, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivateFeedback {
    id: string;
    rating: number;
    content: string;
    created_at: string;
    review_requests?: {
        customer_name?: string;
        customer_email?: string;
        customer_phone?: string;
    } | null;
}

export function PrivateFeedbackCard({ feedback }: { feedback: PrivateFeedback }) {
    const renderStars = (rating: number) => {
        // 1-3 stars are usually red/orange/yellow for negative feedback
        const colorClass = rating === 3 ? "text-yellow-500 fill-yellow-500" : "text-red-500 fill-red-500";
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "w-3.5 h-3.5",
                            i < rating ? colorClass : "text-gray-200 fill-gray-200"
                        )}
                    />
                ))}
            </div>
        );
    };

    const customerName = feedback.review_requests?.customer_name || "Anonymous Customer";
    const customerContact = feedback.review_requests?.customer_email || feedback.review_requests?.customer_phone;

    return (
        <div className="bg-white border rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-sm border border-red-100">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {customerName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(feedback.rating)}
                            <span className="text-xs text-slate-400">• {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Private Feedback
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                    "{feedback.content}"
                </div>

                {customerContact && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                        <span className="font-medium text-slate-500">Contact:</span> {customerContact}
                    </div>
                )}
            </div>
        </div>
    );
}
