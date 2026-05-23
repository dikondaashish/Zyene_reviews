"use client";

import { UpgradeModal } from "@/components/settings/upgrade-modal";

import { QuestionsPageClientAnswerDialog } from "./questions-page-client-answer-dialog";
import { QuestionsPageClientDemoFooter } from "./questions-page-client-demo-footer";
import { QuestionsPageClientDesktopTable } from "./questions-page-client-desktop-table";
import { QuestionsPageClientEmptyState } from "./questions-page-client-empty-state";
import { QuestionsPageClientFilterTabs } from "./questions-page-client-filter-tabs";
import { QuestionsPageClientMobileList } from "./questions-page-client-mobile-list";
import type { GbpQuestionRow, QuestionsPageClientProps } from "./questions-page-client-types";
import { useQuestionsPageClient } from "./use-questions-page-client";

export type { GbpQuestionRow } from "./questions-page-client-types";

export function QuestionsPageClient(props: QuestionsPageClientProps) {
    const v = useQuestionsPageClient(props);

    return (
        <div className="min-w-0 space-y-4 overflow-x-hidden">
            <QuestionsPageClientFilterTabs filter={v.filter} onFilterChange={v.setFilter} />

            {v.filtered.length === 0 ? (
                <QuestionsPageClientEmptyState />
            ) : (
                <>
                    <QuestionsPageClientMobileList
                        rows={v.filtered}
                        isDemo={v.isDemo}
                        onAnswer={v.openAnswer}
                    />
                    <QuestionsPageClientDesktopTable
                        rows={v.filtered}
                        isDemo={v.isDemo}
                        onAnswer={v.openAnswer}
                    />
                </>
            )}

            {v.isDemo && <QuestionsPageClientDemoFooter />}

            <QuestionsPageClientAnswerDialog
                open={v.dialogOpen}
                onOpenChange={v.setDialogOpen}
                answerText={v.answerText}
                onAnswerTextChange={v.setAnswerText}
                suggesting={v.suggesting}
                submitting={v.submitting}
                activeId={v.activeId}
                onSuggest={v.handleSuggest}
                onSubmit={v.handleSubmit}
            />

            <UpgradeModal
                isOpen={v.showUpgradeModal}
                onClose={() => v.setShowUpgradeModal(false)}
                context="ai_reply_plan"
            />
        </div>
    );
}
