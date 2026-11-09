"use client";

import { Mail, MessageSquare } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { reviewRequestFromLine, type ReviewRequestSender } from "@/lib/email/review-request-from-line";
import { dashboardRequestSms } from "@/lib/review-requests/dashboard-request-message";
import { reviewCaptureBaseUrl } from "@/lib/review-requests/review-capture-base";
import type { BusinessFormValues } from "./business-info-form-schema";

type Props = {
    form: UseFormReturn<BusinessFormValues>;
    sender: ReviewRequestSender;
    slug?: string | null;
};

function PreviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[6.5rem_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words font-medium">{value}</dd>
        </div>
    );
}

/** Read-only: how review requests look to customers, updated live as the fields above change. */
export function BusinessInfoSenderPreview({ form, sender, slug }: Props) {
    const [name, senderName, email] = form.watch(["name", "sender_name", "email"]);
    const reviewLink = slug ? reviewCaptureBaseUrl(slug) : "Set your review link in Public profile";
    const sms = dashboardRequestSms("Jordan", name || "", slug ? reviewLink : "<your review link>");

    return (
        <section aria-labelledby="sender-preview-heading" className="rounded-md border border-border bg-muted/40 p-4 space-y-4">
            <div>
                <h5 id="sender-preview-heading" className="text-sm font-semibold">What your customers see</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Preview of review requests sent from your account. Updates as you edit the fields above.
                </p>
            </div>

            <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Mail className="size-3.5" aria-hidden /> Email
                </p>
                <dl className="space-y-1.5">
                    <PreviewRow label="From" value={reviewRequestFromLine(sender, name, senderName)} />
                    <PreviewRow label="Replies go to" value={email?.trim() || "Add a support email above"} />
                    <PreviewRow label="Review link" value={reviewLink} />
                </dl>
            </div>

            <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <MessageSquare className="size-3.5" aria-hidden /> Text message
                </p>
                <dl className="space-y-1.5">
                    <PreviewRow label="From" value="Our verified business texting number" />
                </dl>
                <p className="whitespace-pre-line rounded-md border border-border bg-background p-3 text-sm">{sms}</p>
                <p className="text-xs text-muted-foreground">
                    Sample using the default message and a customer named Jordan. Custom templates change the wording.
                </p>
            </div>
        </section>
    );
}
