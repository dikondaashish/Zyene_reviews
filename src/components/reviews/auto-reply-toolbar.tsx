"use client";

import { UpgradeModal } from "@/components/settings/upgrade-modal";
import { AutoReplyToolbarControls } from "./auto-reply-toolbar-controls";
import type { AutoReplySettingsState } from "./auto-reply-toolbar-types";
import { useAutoReplyToolbar } from "./use-auto-reply-toolbar";

export type { AutoReplyTone, AutoReplySettingsState } from "./auto-reply-toolbar-types";

export function AutoReplyToolbar({
    businessId,
    googleConnected,
    planAllowsAutoCommenter,
    initial,
}: {
    businessId: string;
    googleConnected: boolean;
    planAllowsAutoCommenter: boolean;
    initial: AutoReplySettingsState;
}) {
    const t = useAutoReplyToolbar(businessId, planAllowsAutoCommenter, initial);

    if (!googleConnected) {
        return null;
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
                onToggle={t.onToggle}
                onMinRatingChange={t.onMinRatingChange}
                onToneChange={t.onToneChange}
            />
        </>
    );
}
