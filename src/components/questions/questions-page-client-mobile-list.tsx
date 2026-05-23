"use client";

import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import type { GbpQuestionRow } from "./questions-page-client-types";
import { QuestionsPageClientStatusBadge } from "./questions-page-client-status-badge";

export function QuestionsPageClientMobileList({
    rows,
    isDemo,
    onAnswer,
}: {
    rows: GbpQuestionRow[];
    isDemo: boolean;
    onAnswer: (id: string) => void;
}) {
    return (
        <div className="space-y-3 lg:hidden">
            {rows.map((q) => (
                <div
                    key={q.id}
                    className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <QuestionsPageClientStatusBadge hasMerchantAnswer={q.has_merchant_answer} />
                        {q.upvote_count > 0 ? (
                            <span className="text-xs text-muted-foreground">
                                {q.upvote_count} upvote{q.upvote_count === 1 ? "" : "s"}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2 break-words text-sm leading-snug">{q.question_text}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                        <div>
                            <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                                Asked by
                            </dt>
                            <dd className="mt-0.5 text-foreground">{q.author_display_name || "-"}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                                Updated
                            </dt>
                            <dd className="mt-0.5 text-muted-foreground">
                                {q.google_update_time
                                    ? formatDistanceToNow(new Date(q.google_update_time), {
                                          addSuffix: true,
                                      })
                                    : "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                                Answers
                            </dt>
                            <dd className="mt-0.5">{q.total_answer_count}</dd>
                        </div>
                    </dl>
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => onAnswer(q.id)}
                        disabled={isDemo && q.has_merchant_answer}
                    >
                        {q.has_merchant_answer && !isDemo ? "Update answer" : "Answer"}
                    </Button>
                </div>
            ))}
        </div>
    );
}
