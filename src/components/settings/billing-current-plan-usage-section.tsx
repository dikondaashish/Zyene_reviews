"use client";

import { Mail, MessageSquare, Link as LinkIcon, Bot, MapPin } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { UsageBar } from "@/components/settings/billing-usage-bar";
import type { BillingDerivedState } from "@/components/settings/billing-client-derived";

type BillingDict = Dictionary["billing"];

export function BillingCurrentPlanUsageSection(props: { billing: BillingDict; displayUsage: BillingDerivedState["displayUsage"] }) {
    const { billing: b, displayUsage } = props;

    return (
        <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">{b.usage_title}</h3>
            <UsageBar label={b.email_requests} stat={displayUsage.emailRequests} icon={<Mail className="h-3.5 w-3.5" />} />
            <UsageBar label={b.sms_requests} stat={displayUsage.smsRequests} icon={<MessageSquare className="h-3.5 w-3.5" />} />
            <UsageBar label={b.link_requests} stat={displayUsage.linkRequests} icon={<LinkIcon className="h-3.5 w-3.5" />} />
            <UsageBar label={b.smart_replies} stat={displayUsage.smartReplies} icon={<Bot className="h-3.5 w-3.5" />} />
            <UsageBar label={b.locations} stat={displayUsage.businesses} icon={<MapPin className="h-3.5 w-3.5" />} />
        </div>
    );
}
