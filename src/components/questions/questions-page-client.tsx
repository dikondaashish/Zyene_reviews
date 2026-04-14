"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { HelpCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { UpgradeModal } from "@/components/settings/upgrade-modal";

export type GbpQuestionRow = {
    id: string;
    question_text: string;
    author_display_name: string | null;
    google_update_time: string | null;
    total_answer_count: number;
    has_merchant_answer: boolean;
    upvote_count: number;
};

const DEMO_QUESTIONS: GbpQuestionRow[] = [
    {
        id: "demo-q1",
        question_text: "Do you offer same-day appointments?",
        author_display_name: "Jordan K.",
        google_update_time: new Date(Date.now() - 86400000 * 2).toISOString(),
        total_answer_count: 0,
        has_merchant_answer: false,
        upvote_count: 4,
    },
    {
        id: "demo-q2",
        question_text: "Is parking available on site?",
        author_display_name: "Sam T.",
        google_update_time: new Date(Date.now() - 86400000 * 5).toISOString(),
        total_answer_count: 1,
        has_merchant_answer: true,
        upvote_count: 2,
    },
    {
        id: "demo-q3",
        question_text: "What are your hours on Saturday?",
        author_display_name: "Alex M.",
        google_update_time: new Date(Date.now() - 86400000).toISOString(),
        total_answer_count: 0,
        has_merchant_answer: false,
        upvote_count: 1,
    },
];

export function QuestionsPageClient({
    questions,
    isDemo,
}: {
    questions: GbpQuestionRow[];
    isDemo: boolean;
}) {
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

    return (
        <div className="space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unanswered")}>
                <TabsList variant="line" className="w-full justify-start border-b border-border">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                </TabsList>
            </Tabs>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
                    <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">No questions match this filter</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Sync runs with your Google listing sync. You can trigger a sync from the header.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
                            {filtered.map((q) => (
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
                                    <TableCell className="text-center text-sm">
                                        {q.total_answer_count}
                                    </TableCell>
                                    <TableCell>
                                        {q.has_merchant_answer ? (
                                            <Badge variant="secondary">Answered</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
                                                Needs answer
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openAnswer(q.id)}
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
            )}

            {isDemo && (
                <p className="text-center text-xs text-muted-foreground">
                    Showing sample Q&A.{" "}
                    <Link href="/integrations" className="text-primary underline underline-offset-2">
                        Connect Google
                    </Link>{" "}
                    to load real questions.
                </p>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Answer on Google</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Write a helpful, accurate answer for searchers…"
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            rows={6}
                            className="resize-y"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-1.5"
                            onClick={handleSuggest}
                            disabled={suggesting || !activeId}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            {suggesting ? "Suggesting…" : "Suggest with AI"}
                        </Button>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting || !answerText.trim()}>
                            {submitting ? "Posting…" : "Post to Google"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Upgrade for AI suggestions"
                description="AI review features are available on active Starter, Professional, and Enterprise plans."
            />
        </div>
    );
}
