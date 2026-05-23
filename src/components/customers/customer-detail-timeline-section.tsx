"use client";

import { Activity, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TimelineItem } from "@/lib/customers/customer-detail-data";
import { SectionHeading } from "@/components/customers/customer-detail-helpers";
import { CustomerDetailTimelineRequestItem } from "@/components/customers/customer-detail-timeline-request-item";
import { CustomerDetailTimelineFeedbackItem } from "@/components/customers/customer-detail-timeline-feedback-item";
import { CustomerDetailTimelinePlatformReviewItem } from "@/components/customers/customer-detail-timeline-platform-review-item";

export function CustomerDetailTimelineSection({ timeline }: { timeline: TimelineItem[] }) {
    return (
        <section>
            <SectionHeading
                icon={Activity}
                title="Activity"
                description="Review requests and feedback for this contact, newest first."
            />
            <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                <CardContent className="p-0">
                    {timeline.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">No activity yet</p>
                            <p className="max-w-md text-sm text-muted-foreground">
                                When you send a request or this contact leaves feedback, it will show up here.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border/80">
                            {timeline.map((item) => (
                                <li key={`${item.type}-${item.id}`} className="px-5 py-5 sm:px-8">
                                    {item.type === "request" ? (
                                        <CustomerDetailTimelineRequestItem item={item} />
                                    ) : item.type === "feedback" ? (
                                        <CustomerDetailTimelineFeedbackItem item={item} />
                                    ) : (
                                        <CustomerDetailTimelinePlatformReviewItem item={item} />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
