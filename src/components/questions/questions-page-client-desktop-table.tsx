"use client";

import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { GbpQuestionRow } from "./questions-page-client-types";
import { QuestionsPageClientStatusBadge } from "./questions-page-client-status-badge";

export function QuestionsPageClientDesktopTable({
    rows,
    isDemo,
    onAnswer,
}: {
    rows: GbpQuestionRow[];
    isDemo: boolean;
    onAnswer: (id: string) => void;
}) {
    return (
        <div className="hidden overflow-x-auto rounded-lg border border-border bg-card lg:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[200px]">Question</TableHead>
                        <TableHead>Asked by</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-center">Answers</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((q) => (
                        <TableRow key={q.id}>
                            <TableCell className="max-w-md align-top">
                                <p className="text-sm leading-snug">{q.question_text}</p>
                                {q.upvote_count > 0 && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {q.upvote_count} upvote{q.upvote_count === 1 ? "" : "s"}
                                    </p>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {q.author_display_name || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                {q.google_update_time
                                    ? formatDistanceToNow(new Date(q.google_update_time), {
                                          addSuffix: true,
                                      })
                                    : "—"}
                            </TableCell>
                            <TableCell className="text-center text-sm">{q.total_answer_count}</TableCell>
                            <TableCell>
                                <QuestionsPageClientStatusBadge hasMerchantAnswer={q.has_merchant_answer} />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onAnswer(q.id)}
                                    disabled={isDemo && q.has_merchant_answer}
                                >
                                    {q.has_merchant_answer && !isDemo ? "Update answer" : "Answer"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
