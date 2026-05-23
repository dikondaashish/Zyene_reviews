"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function QuestionsPageClientAnswerDialog({
    open,
    onOpenChange,
    answerText,
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
                </DialogHeader>
                <div className="space-y-3">
                    <Textarea
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
                        <Sparkles className="h-3.5 w-3.5" />
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
