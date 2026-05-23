"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CustomerDetailStats, TimelineItem } from "@/lib/customers/customer-detail-data";
import {
    displayName,
    initials,
    type CustomerRow,
} from "@/components/customers/customer-detail-helpers";
import { useCustomerDetailMutations } from "@/components/customers/use-customer-detail-mutations";
import { CustomerDetailSendReviewButton } from "@/components/customers/customer-detail-send-review-button";
import { CustomerDetailHeader } from "@/components/customers/customer-detail-header";
import { CustomerDetailProfileCard } from "@/components/customers/customer-detail-profile-card";
import { CustomerDetailStatsSection } from "@/components/customers/customer-detail-stats-section";
import { CustomerDetailTimelineSection } from "@/components/customers/customer-detail-timeline-section";

interface CustomerDetailClientProps {
    customer: CustomerRow;
    businessId: string;
    businessSlug?: string | null;
    businessName?: string | null;
    timeline: TimelineItem[];
    stats: CustomerDetailStats;
}

export function CustomerDetailClient({
    customer: initial,
    businessId,
    businessSlug,
    businessName,
    timeline,
    stats,
}: CustomerDetailClientProps) {
    const router = useRouter();
    const [customer, setCustomer] = React.useState(initial);
    const [editingName, setEditingName] = React.useState(false);
    const [nameDraft, setNameDraft] = React.useState(displayName(initial) || "");
    const [tagInput, setTagInput] = React.useState("");
    const skipBlurNameRef = React.useRef(false);

    React.useEffect(() => {
        setCustomer(initial);
        if (!editingName) setNameDraft(displayName(initial) || "");
    }, [initial, editingName]);

    const { saveName, saveTags } = useCustomerDetailMutations(
        customer,
        setCustomer,
        businessId,
        router,
        nameDraft,
        setEditingName
    );

    const tags = customer.tags ?? [];
    const name = displayName(customer);
    const avatarText = initials(customer);
    const avatarCompact = avatarText.length > 2;
    const pageHeading = name || customer.phone?.trim() || customer.email?.trim() || "Unnamed contact";
    const missingPhoneAndEmail = !customer.phone?.trim() && !customer.email?.trim();
    const summaryHasNoEngagement = stats.totalRequestsSent === 0 && stats.reviewsLeftCount === 0;

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) return;
        if (tags.includes(t)) {
            setTagInput("");
            return;
        }
        void saveTags([...tags, t]);
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        void saveTags(tags.filter((x) => x !== tag));
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            <CustomerDetailHeader
                pageHeading={pageHeading}
                actions={
                    <CustomerDetailSendReviewButton
                        customer={customer}
                        businessId={businessId}
                        businessSlug={businessSlug}
                        businessName={businessName}
                    />
                }
            />

            {missingPhoneAndEmail ? (
                <Alert className="border-chart-4/35 bg-chart-4/5 text-foreground [&>svg]:text-chart-4">
                    <CircleAlert className="size-4" />
                    <AlertTitle>Add phone or email</AlertTitle>
                    <AlertDescription>
                        Campaigns need at least one channel to reach this contact. Add details below before sending a
                        review request.
                    </AlertDescription>
                </Alert>
            ) : null}

            <CustomerDetailProfileCard
                customer={customer}
                editingName={editingName}
                setEditingName={setEditingName}
                nameDraft={nameDraft}
                setNameDraft={setNameDraft}
                skipBlurNameRef={skipBlurNameRef}
                saveName={saveName}
                avatarText={avatarText}
                avatarCompact={avatarCompact}
                tags={tags}
                tagInput={tagInput}
                setTagInput={setTagInput}
                addTag={addTag}
                removeTag={removeTag}
            />

            <CustomerDetailStatsSection stats={stats} summaryHasNoEngagement={summaryHasNoEngagement} />

            <CustomerDetailTimelineSection timeline={timeline} />
        </div>
    );
}
