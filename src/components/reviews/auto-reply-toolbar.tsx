"use client";

import { useState } from "react";
import { AutoReplyEnableDialog } from "@/components/reviews/auto-reply-enable-dialog";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import type { ReplyRulesSummary } from "@/services/reviews/reply-rules-summary-load";
import { AutoReplyToolbarControls } from "./auto-reply-toolbar-controls";
import { ReplyRulesSummaryPanel } from "./reply-rules-summary-panel";
import type { AutoReplySettingsState } from "./auto-reply-toolbar-types";
import { useAutoReplyToolbar } from "./use-auto-reply-toolbar";

export type { AutoReplyTone, AutoReplySettingsState } from "./auto-reply-toolbar-types";

export function AutoReplyToolbar({
    businessId,
    googleConnected,
    planAllowsAutoCommenter,
    initial,
    replyRules,
}: {
    businessId: string;
    googleConnected: boolean;
    planAllowsAutoCommenter: boolean;
    initial: AutoReplySettingsState;
    replyRules: ReplyRulesSummary;
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const t = useAutoReplyToolbar(businessId, planAllowsAutoCommenter, initial);

    if (!googleConnected) {
        return null;
    }
    // Rules replace the single switch (see the reply rules settings page).
    if (replyRules.enabled) {
        return <ReplyRulesSummaryPanel summary={replyRules} />;
    }

    return (
        <>
            <UpgradeModal
                isOpen={t.upgradeOpen}
                onClose={() => t.setUpgradeOpen(false)}
                context="auto_commenter"
            />
            <AutoReplyToolbarControls
                enabled={t.enabled}
                minRating={t.minRating}
                tone={t.tone}
                saving={t.saving}
                onToggle={on => on && planAllowsAutoCommenter ? setConfirmOpen(true) : void t.onToggle(on)}
                onMinRatingChange={t.onMinRatingChange}
                onToneChange={t.onToneChange}
            />
            <AutoReplyEnableDialog open={confirmOpen} onOpenChange={setConfirmOpen} minRating={t.minRating} tone={t.tone} onConfirm={() => { setConfirmOpen(false); void t.onToggle(true); }} />
        </>
    );
}
