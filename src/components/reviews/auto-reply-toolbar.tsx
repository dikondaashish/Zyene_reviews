"use client";

import { useCallback, useState } from "react";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, CircleHelp, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AUTO_COMMENTER_HELP =
    "Only reviews that show up after you turn this on: if there is no reply yet and the stars meet your minimum, we draft a reply in your tone and post it on Google. Plan limits still apply.";

export type AutoReplyTone = "professional" | "friendly" | "concise";

export interface AutoReplySettingsState {
    auto_reply_enabled: boolean;
    auto_reply_min_rating: 3 | 4 | 5;
    auto_reply_tone: AutoReplyTone;
}

const TONES: { id: AutoReplyTone; label: string }[] = [
    { id: "professional", label: "Professional" },
    { id: "friendly", label: "Friendly" },
    { id: "concise", label: "Concise" },
];

export function AutoReplyToolbar({
    businessId,
    googleConnected,
    planAllowsAutoCommenter,
    initial,
}: {
    businessId: string;
    googleConnected: boolean;
    planAllowsAutoCommenter: boolean;
    initial: AutoReplySettingsState;
}) {
    const [enabled, setEnabled] = useState(initial.auto_reply_enabled);
    const [minRating, setMinRating] = useState<3 | 4 | 5>(initial.auto_reply_min_rating);
    const [tone, setTone] = useState<AutoReplyTone>(initial.auto_reply_tone);
    const [saving, setSaving] = useState(false);
    const [upgradeOpen, setUpgradeOpen] = useState(false);

    const persist = useCallback(
        async (patch: Partial<AutoReplySettingsState>) => {
            setSaving(true);
            try {
                const res = await fetch(`/api/businesses/${businessId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patch),
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(json?.error || json?.message || "Failed to save");
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Save failed";
                toast.error(msg);
                throw e;
            } finally {
                setSaving(false);
            }
        },
        [businessId]
    );

    const onToggle = async (on: boolean) => {
        if (on && !planAllowsAutoCommenter) {
            setUpgradeOpen(true);
            return;
        }
        const prev = enabled;
        setEnabled(on);
        try {
            await persist({ auto_reply_enabled: on });
            toast.success(on ? "Auto commenter on" : "Auto commenter off");
        } catch {
            setEnabled(prev);
        }
    };

    const onMinRatingChange = async (v: string) => {
        const n = parseInt(v, 10) as 3 | 4 | 5;
        const prev = minRating;
        setMinRating(n);
        try {
            await persist({ auto_reply_min_rating: n });
        } catch {
            setMinRating(prev);
        }
    };

    const onToneChange = async (t: AutoReplyTone) => {
        const prev = tone;
        setTone(t);
        try {
            await persist({ auto_reply_tone: t });
        } catch {
            setTone(prev);
        }
    };

    if (!googleConnected) {
        return null;
    }

    return (
        <>
        <UpgradeModal
            isOpen={upgradeOpen}
            onClose={() => setUpgradeOpen(false)}
            title="Upgrade to use Auto commenter"
            description="Auto commenter posts AI replies to eligible Google reviews. It is available on Starter, Professional, and Enterprise."
        />
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/80 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
                <Bot className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                <Label htmlFor="auto-reply-enabled" className="text-xs font-semibold text-foreground cursor-pointer">
                    Auto commenter
                </Label>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
                                aria-label="How auto commenter works"
                            >
                                <CircleHelp className="h-3.5 w-3.5" aria-hidden />
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
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden />}
            </div>

            {enabled && (
                <>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                            Min stars
                        </span>
                        <Select
                            value={String(minRating)}
                            onValueChange={(v) => void onMinRatingChange(v)}
                            disabled={saving}
                        >
                            <SelectTrigger className="h-10 w-[130px] text-sm bg-background md:h-8 md:text-xs">
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
                        {TONES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                disabled={saving}
                                onClick={() => void onToneChange(t.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors",
                                    tone === t.id
                                        ? "bg-violet-600 text-white border-violet-600"
                                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
        </>
    );
}
