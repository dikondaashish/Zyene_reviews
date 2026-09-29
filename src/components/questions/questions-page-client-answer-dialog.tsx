"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function QuestionsPageClientAnswerDialog({
    open,
    onOpenChange,
    answerText,
    questionText,
    onAnswerTextChange,
    suggesting,
    submitting,
    activeId,
    onSuggest,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    answerText: string;
    questionText: string | undefined;
    onAnswerTextChange: (value: string) => void;
    suggesting: boolean;
    submitting: boolean;
    activeId: string | null;
    onSuggest: () => void;
    onSubmit: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Answer on Google</DialogTitle>
                    <DialogDescription>Review your answer before publishing it to your business listing.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {questionText && <blockquote className="max-h-40 overflow-y-auto break-words rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">{questionText}</blockquote>}
                    <Label htmlFor="google-question-answer">Your answer</Label>
                    <Textarea
                        id="google-question-answer"
                        placeholder="Write a helpful, accurate answer for searchers…"
                        value={answerText}
                        onChange={(e) => onAnswerTextChange(e.target.value)}
                        rows={6}
                        className="resize-y"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1.5"
                        onClick={onSuggest}
                        disabled={suggesting || !activeId}
                    >
                        <Sparkles className="size-3.5" />
                        {suggesting ? "Suggesting…" : "Suggest with AI"}
                    </Button>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={submitting || !answerText.trim()}>
                        {submitting ? "Posting…" : "Post to Google"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
