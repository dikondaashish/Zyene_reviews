"use client";

import { Bot, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AUTO_REPLY_TONES, type AutoReplyTone } from "@/components/reviews/auto-reply-toolbar-types";

export function AutoReplyToolbarControls({
    enabled,
    minRating,
    tone,
    saving,
    onToggle,
    onMinRatingChange,
    onToneChange,
}: {
    enabled: boolean;
    minRating: 3 | 4 | 5;
    tone: AutoReplyTone;
    saving: boolean;
    onToggle: (on: boolean) => void;
    onMinRatingChange: (value: string) => void;
    onToneChange: (tone: AutoReplyTone) => void;
}) {
    return (
        <section
            aria-label="Automatic Google replies"
            className="w-full space-y-4 rounded-xl border border-border bg-card p-4 sm:max-w-xl"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Bot className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                        <Label htmlFor="auto-reply-enabled" className="cursor-pointer text-sm font-semibold">
                            Automatically publish AI replies to Google
                        </Label>
                        <p id="auto-reply-explanation" className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            For new, unanswered reviews at the selected business. Choose your settings before turning it
                            on.
                        </p>
                    </div>
                </div>
                <Switch
                    id="auto-reply-enabled"
                    aria-describedby="auto-reply-explanation"
                    checked={enabled}
                    onCheckedChange={onToggle}
                    disabled={saving}
                />
            </div>
            <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="auto-reply-rating" className="text-xs">
                        Reviews to reply to
                    </Label>
                    <Select value={String(minRating)} onValueChange={onMinRatingChange} disabled={saving}>
                        <SelectTrigger id="auto-reply-rating" className="min-h-10 w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[3, 4, 5].map((rating) => (
                                <SelectItem key={rating} value={String(rating)}>
                                    {rating} stars {rating === 5 ? "only" : "and up"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <fieldset className="space-y-1.5" disabled={saving}>
                    <legend className="mb-1.5 text-xs font-medium">Reply tone</legend>
                    <div className="flex flex-wrap gap-1.5">
                        {AUTO_REPLY_TONES.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={tone === option.id}
                                onClick={() => onToneChange(option.id)}
                                className={cn(
                                    "min-h-10 rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                                    tone === option.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-foreground hover:bg-accent",
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </fieldset>
            </div>
            <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
                {saving && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
                {saving
                    ? "Saving settings…"
                    : enabled
                      ? "Automatic publishing is on. You can turn it off at any time."
                      : "Automatic publishing is off. No replies will be posted automatically."}
            </p>
        </section>
    );
}
