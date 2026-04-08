"use client";

import { TimeAgo } from "@/components/ui/time-ago";
import { Star, User, Mail, MessageSquare, CheckCircle2, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/index";
import { useState } from "react";
import { toast } from "sonner";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PrivateFeedback {
    id: string;
    rating: number;
    content: string;
    created_at: string;
    customer_email?: string | null;
    status?: string | null;
    category?: string | null;
    review_requests?: {
        customer_name?: string;
        customer_email?: string;
        customer_phone?: string;
    } | null;
}

export function PrivateFeedbackCard({ feedback }: { feedback: PrivateFeedback }) {
    const [status, setStatus] = useState(feedback.status || "open");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/reviews/private/${feedback.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setStatus(newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

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
    const displayEmail = feedback.customer_email || feedback.review_requests?.customer_email;
    const customerContact = displayEmail || feedback.review_requests?.customer_phone;

    return (
        <div className={cn(
            "bg-white border rounded-lg p-5 space-y-4 hover:shadow-md transition-all duration-200 border-l-4",
            status === "open" ? "border-l-red-500" : 
            status === "contacted" ? "border-l-yellow-500" : "border-l-emerald-500 shadow-sm opacity-90"
        )}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border",
                        status === "open" ? "bg-red-50 text-red-500 border-red-100" : 
                        status === "contacted" ? "bg-yellow-50 text-yellow-600 border-yellow-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm text-gray-900 line-clamp-1">
                                {customerName}
                            </div>
                            {feedback.category && (
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border-none">
                                    {feedback.category}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(feedback.rating)}
                            <TimeAgo date={feedback.created_at} className="text-xs text-slate-400" />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Select value={status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
                        <SelectTrigger className={cn(
                            "h-7 w-[110px] text-[10px] font-bold uppercase tracking-wider border-none ring-0 focus:ring-0",
                            status === "open" ? "bg-red-50 text-red-600" : 
                            status === "contacted" ? "bg-yellow-50 text-yellow-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Open</span>
                            </SelectItem>
                            <SelectItem value="contacted">
                                <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Contacted</span>
                            </SelectItem>
                            <SelectItem value="resolved">
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Resolved</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 italic">
                    "{feedback.content}"
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {displayEmail && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${displayEmail}`} className="hover:underline">{displayEmail}</a>
                        </div>
                    )}
                    {feedback.review_requests?.customer_phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            <span>{feedback.review_requests.customer_phone}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {status === "resolved" && (
                <div className="pt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <CheckCircle className="w-3 h-3" />
                    Conversation marked as recovered
                </div>
            )}
        </div>
    );
}
