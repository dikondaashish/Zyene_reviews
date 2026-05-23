"use client";

import { useCallback } from "react";
import {
    EVERYTHING_TAG,
    MAX_CUSTOM_TAG_CHIPS,
    normalizeCustomTagInput,
} from "@/lib/review-flow/tags-for-ai";

export function useReviewFlowTagHandlers(options: {
    customTagInput: string;
    setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
    setAddedCustomTags: React.Dispatch<React.SetStateAction<string[]>>;
    setCustomTagInput: React.Dispatch<React.SetStateAction<string>>;
    setShowCustomInput: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedStaff: React.Dispatch<React.SetStateAction<string[]>>;
    trackRequestUpdate: (trackData: Record<string, unknown>) => Promise<void>;
}) {
    const {
        customTagInput,
        setSelectedTags,
        setAddedCustomTags,
        setCustomTagInput,
        setShowCustomInput,
        setSelectedStaff,
        trackRequestUpdate,
    } = options;

    const handleToggleEverything = useCallback(() => {
        setAddedCustomTags([]);
        setCustomTagInput("");
        setShowCustomInput(false);
        setSelectedTags((prev) => (prev.includes(EVERYTHING_TAG) ? [] : [EVERYTHING_TAG]));
    }, [setAddedCustomTags, setCustomTagInput, setSelectedTags, setShowCustomInput]);

    const openCustomInputPanel = useCallback(() => {
        setSelectedTags((prev) => prev.filter((t) => t !== EVERYTHING_TAG));
        setShowCustomInput(true);
    }, [setSelectedTags, setShowCustomInput]);

    const addCustomTag = useCallback(() => {
        const normalized = normalizeCustomTagInput(customTagInput);
        if (!normalized) return;
        setAddedCustomTags((prev) => {
            if (prev.length >= MAX_CUSTOM_TAG_CHIPS) return prev;
            if (prev.some((t) => t.toLowerCase() === normalized.toLowerCase())) return prev;
            return [...prev, normalized];
        });
        setCustomTagInput("");
    }, [customTagInput, setAddedCustomTags, setCustomTagInput]);

    const removeCustomTag = useCallback(
        (index: number) => {
            setAddedCustomTags((prev) => prev.filter((_, i) => i !== index));
        },
        [setAddedCustomTags]
    );

    const toggleTag = useCallback(
        (tag: string) => {
            if (tag === EVERYTHING_TAG) {
                handleToggleEverything();
                return;
            }
            setSelectedTags((prev) => {
                const withoutEverything = prev.filter((t) => t !== EVERYTHING_TAG);
                return withoutEverything.includes(tag)
                    ? withoutEverything.filter((t) => t !== tag)
                    : [...withoutEverything, tag];
            });
        },
        [handleToggleEverything, setSelectedTags]
    );

    const toggleStaff = useCallback(
        (name: string) => {
            setSelectedStaff((prev) => {
                const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
                void trackRequestUpdate({ selected_staff: next });
                return next;
            });
        },
        [setSelectedStaff, trackRequestUpdate]
    );

    return {
        handleToggleEverything,
        openCustomInputPanel,
        addCustomTag,
        removeCustomTag,
        toggleTag,
        toggleStaff,
    };
}
