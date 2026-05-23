"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DEMO_QUESTIONS } from "./questions-page-client-demo-questions";
import type { GbpQuestionRow, QuestionsPageClientProps } from "./questions-page-client-types";

export function useQuestionsPageClient({ questions, isDemo }: QuestionsPageClientProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "unanswered">("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const rows = isDemo ? DEMO_QUESTIONS : questions;

    const filtered = useMemo(() => {
        if (filter === "unanswered") {
            return rows.filter((q) => !q.has_merchant_answer);
        }
        return rows;
    }, [rows, filter]);

    const openAnswer = (id: string) => {
        setActiveId(id);
        setAnswerText("");
        setDialogOpen(true);
    };

    const handleSuggest = async () => {
        if (!activeId || isDemo) {
            toast.message("Connect Google Business Profile to use AI suggestions.");
            return;
        }
        setSuggesting(true);
        try {
            const res = await fetch("/api/ai/suggest-qa-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId: activeId }),
            });
            const data = await res.json();
            if (!res.ok && data?.code === "AI_QA_PLAN_REQUIRED") {
                setShowUpgradeModal(true);
                return;
            }
            if (!res.ok) throw new Error(data.error || "Suggestion failed");
            const text = typeof data.answer === "string" ? data.answer : "";
            setAnswerText(text);
            toast.success("Suggestion added — review before posting.");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Suggestion failed");
        } finally {
            setSuggesting(false);
        }
    };

    const handleSubmit = async () => {
        if (!activeId || !answerText.trim()) return;
        if (isDemo) {
            toast.message("Connect Google in Integrations to post answers to your listing.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/google/qa/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId: activeId, text: answerText.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post answer");
            toast.success("Answer posted on Google");
            setDialogOpen(false);
            setAnswerText("");
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to post");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        filter,
        setFilter,
        filtered,
        isDemo,
        dialogOpen,
        setDialogOpen,
        answerText,
        setAnswerText,
        submitting,
        suggesting,
        activeId,
        showUpgradeModal,
        setShowUpgradeModal,
        openAnswer,
        handleSuggest,
        handleSubmit,
    };
}
