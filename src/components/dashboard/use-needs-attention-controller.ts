import { useCallback, useMemo, useState } from "react";
import type { ReplyTone } from "@/domains/ai/services/generate-reply-draft";
import { DEFAULT_NEEDS_ATTENTION_COPY } from "@/components/dashboard/needs-attention-default-copy";
import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";
import { useNeedsAttentionAiStream } from "@/components/dashboard/use-needs-attention-ai-stream";
import { useNeedsAttentionRunDraft } from "@/components/dashboard/use-needs-attention-run-draft";
import { useNeedsAttentionSendReply } from "@/components/dashboard/use-needs-attention-send-reply";

type ToneCache = Record<string, Partial<Record<ReplyTone, string>>>;

export function useNeedsAttentionController({
    copy: copyProp,
    planAllowsAiReplies,
    isDemo,
}: {
    copy?: Partial<NeedsAttentionCopy>;
    planAllowsAiReplies: boolean;
    isDemo: boolean;
}) {
    const copy = useMemo(() => ({ ...DEFAULT_NEEDS_ATTENTION_COPY, ...copyProp }), [copyProp]);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [sent, setSent] = useState<Record<string, boolean>>({});
    const [generating, setGenerating] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
    const [tones, setTones] = useState<Record<string, ReplyTone>>({});
    const [toneCache, setToneCache] = useState<ToneCache>({});
    const [aiTyping, setAiTyping] = useState<Record<string, boolean>>({});
    const [manualCompose, setManualCompose] = useState<Record<string, boolean>>({});
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeModalKind, setUpgradeModalKind] = useState<"limit" | "plan">("limit");

    const { startAiStream, stopAiStream } = useNeedsAttentionAiStream(setDrafts, setAiTyping);

    const runDraft = useNeedsAttentionRunDraft({
        isDemo,
        planAllowsAiReplies,
        tones,
        toneCache,
        setTones,
        setGenerating,
        setToneCache,
        setUpgradeModalKind,
        setShowUpgradeModal,
        startAiStream,
        stopAiStream,
    });

    const sendReply = useNeedsAttentionSendReply({
        drafts,
        isDemo,
        copyDemoSendHint: copy.demoSendHint,
        stopAiStream,
        setSubmitting,
        setSent,
        setToneCache,
        setExpandedId,
        setUpgradeModalKind,
        setShowUpgradeModal,
    });

    const toggleRow = useCallback((id: string) => {
        setExpandedId((cur) => (cur === id ? null : id));
    }, []);

    return {
        copy,
        expandedId,
        drafts,
        setDrafts,
        sent,
        generating,
        submitting,
        tones,
        aiTyping,
        manualCompose,
        setManualCompose,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeModalKind,
        runDraft,
        sendReply,
        stopAiStream,
        toggleRow,
    };
}
