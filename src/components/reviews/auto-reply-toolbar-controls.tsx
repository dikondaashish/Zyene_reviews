"use client";

import { Bot, CircleHelp, Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AUTO_COMMENTER_HELP, AUTO_REPLY_TONES, type AutoReplyTone } from "./auto-reply-toolbar-types";

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
    onMinRatingChange: (v: string) => void;
    onToneChange: (t: AutoReplyTone) => void;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-muted/80 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
                <Bot className="shrink-0 text-sync-action size-4" aria-hidden />
                <Label htmlFor="auto-reply-enabled" className="text-xs font-semibold text-foreground cursor-pointer">
                    Auto commenter
                </Label>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                                aria-label="How auto commenter works"
                            >
                                <CircleHelp className="size-3.5" aria-hidden />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            sideOffset={6}
                            className="max-w-[min(280px,calc(100vw-2rem))] px-3 py-2 text-left text-xs leading-snug"
                        >
                            {AUTO_COMMENTER_HELP}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Switch
                    id="auto-reply-enabled"
                    checked={enabled}
                    onCheckedChange={(v) => void onToggle(!!v)}
                    disabled={saving}
                />
                {saving && <Loader2 className="animate-spin text-muted-foreground size-3.5" aria-hidden />}
            </div>

            {enabled && (
                <>
                    <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            Min stars
                        </span>
                        <Select
                            value={String(minRating)}
                            onValueChange={(v) => void onMinRatingChange(v)}
                            disabled={saving}
                        >
                            <SelectTrigger className="h-9 w-full bg-background text-sm sm:w-[130px] md:h-8 md:text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3★ and up</SelectItem>
                                <SelectItem value="4">4★ and up</SelectItem>
                                <SelectItem value="5">5★ only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mr-1">
                            Tone
                        </span>
                        {AUTO_REPLY_TONES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                disabled={saving}
                                onClick={() => void onToneChange(t.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors",
                                    tone === t.id
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-border hover:border-foreground/30",
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
