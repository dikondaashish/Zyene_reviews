"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { AutoReplySettingsState, AutoReplyTone } from "./auto-reply-toolbar-types";

export function useAutoReplyToolbar(
    businessId: string,
    planAllowsAutoCommenter: boolean,
    initial: AutoReplySettingsState,
) {
    const [enabled, setEnabled] = useState(initial.auto_reply_enabled);
    const [minRating, setMinRating] = useState<3 | 4 | 5>(initial.auto_reply_min_rating);
    const [tone, setTone] = useState<AutoReplyTone>(initial.auto_reply_tone);
    const [saving, setSaving] = useState(false);
    const [upgradeOpen, setUpgradeOpen] = useState(false);

    const persist = useCallback(
        async (patch: Partial<AutoReplySettingsState>) => {
            setSaving(true);
            try {
                const res = await fetch(`/api/businesses/${businessId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patch),
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(json?.error || json?.message || "Failed to save");
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Save failed";
                toast.error(msg);
                throw e;
            } finally {
                setSaving(false);
            }
        },
        [businessId],
    );

    const onToggle = async (on: boolean) => {
        if (on && !planAllowsAutoCommenter) {
            setUpgradeOpen(true);
            return;
        }
        const prev = enabled;
        setEnabled(on);
        try {
            await persist({ auto_reply_enabled: on });
            toast.success(on ? "Auto commenter on" : "Auto commenter off");
        } catch {
            setEnabled(prev);
        }
    };

    const onMinRatingChange = async (v: string) => {
        const n = parseInt(v, 10) as 3 | 4 | 5;
        const prev = minRating;
        setMinRating(n);
        try {
            await persist({ auto_reply_min_rating: n });
        } catch {
            setMinRating(prev);
        }
    };

    const onToneChange = async (t: AutoReplyTone) => {
        const prev = tone;
        setTone(t);
        try {
            await persist({ auto_reply_tone: t });
        } catch {
            setTone(prev);
        }
    };

    return {
        enabled,
        minRating,
        tone,
        saving,
        upgradeOpen,
        setUpgradeOpen,
        onToggle,
        onMinRatingChange,
        onToneChange,
    };
}
