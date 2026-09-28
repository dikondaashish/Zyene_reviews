"use client";

import { Bot, ChevronDown, Loader2 } from "lucide-react";
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
        <details className="group rounded-xl border border-border bg-card">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Bot className="size-4 text-muted-foreground" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        Automatic replies
                        <span className={cn("rounded-md px-1.5 py-0.5 text-xs", enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{enabled ? "On" : "Off"}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                        {enabled ? `Google · ${minRating === 5 ? "5-star reviews" : `${minRating} stars and up`} · ${tone.charAt(0).toUpperCase() + tone.slice(1)} tone` : "Save time with AI replies to new Google reviews."}
                    </span>
                </span>
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">Settings</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <section aria-label="Automatic Google replies" className="space-y-4 border-t border-border p-4 sm:p-5">
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
        </details>
    );
}
