"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ReviewContentFeedbackContactSection } from "@/components/settings/review-content-feedback-contact-section";
import { ReviewContentFeedbackCopyFields } from "@/components/settings/review-content-feedback-copy-fields";
import { ReviewContentFeedbackOfferSection } from "@/components/settings/review-content-feedback-offer-section";
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentFeedbackTab({ form }: ReviewContentTabProps) {
    return (
        <TabsContent value="feedback" className="space-y-5 mt-0">
            <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Negative Feedback</h4>
                <p className="text-sm text-muted-foreground">Private feedback form shown for lower ratings (1-3 stars).</p>
            </div>
            <div className="space-y-4">
                <ReviewContentFeedbackCopyFields form={form} />
                <ReviewContentFeedbackOfferSection form={form} />
                <ReviewContentFeedbackContactSection form={form} />
            </div>
        </TabsContent>
    );
}
