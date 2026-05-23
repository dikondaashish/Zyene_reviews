import { Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PrivateFeedback } from "./private-feedback-card-types";

export function PrivateFeedbackCardBody({ feedback }: { feedback: PrivateFeedback }) {
    const displayEmail = feedback.customer_email || feedback.review_requests?.customer_email;
    const displayPhone = feedback.customer_phone?.trim() || feedback.review_requests?.customer_phone?.trim();

    return (
        <div className="relative z-10 space-y-3">
            <div className="rounded-md border border-border bg-muted p-3 text-sm italic leading-relaxed text-foreground break-words">
                &ldquo;{feedback.content}&rdquo;
            </div>

            {feedback.selected_staff && feedback.selected_staff.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Served by:
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {feedback.selected_staff.map((staff) => (
                            <Badge
                                key={staff}
                                variant="outline"
                                className="px-2 py-0 h-4 text-[10px] bg-primary/10 text-primary border-primary/20"
                            >
                                {staff}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                {displayEmail && (
                    <div className="flex min-w-0 items-start gap-1.5 text-[11px] text-muted-foreground">
                        <Mail className="mt-0.5 shrink-0 size-3" />
                        <a href={`mailto:${displayEmail}`} className="break-all hover:underline">
                            {displayEmail}
                        </a>
                    </div>
                )}
                {displayPhone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Phone className="shrink-0 size-3" />
                        <a href={`tel:${displayPhone.replace(/\s/g, "")}`} className="hover:underline">
                            {displayPhone}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
