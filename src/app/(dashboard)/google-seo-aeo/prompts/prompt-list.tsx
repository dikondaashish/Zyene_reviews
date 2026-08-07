"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deletePrompt, setPromptActive } from "./prompt-actions";
import type { PromptRow } from "./load-prompts-page-data";

/**
 * The prompt table.
 *
 * Activation is the only control that costs money, so it is the only one that
 * states its consequence inline — the row shows how many engines a prompt will
 * fan out to the moment it is switched on.
 */
export function PromptList({
    prompts,
    runnableEngineCount,
}: {
    prompts: PromptRow[];
    runnableEngineCount: number;
}) {
    const [pending, setPending] = React.useState<string | null>(null);

    async function toggle(prompt: PromptRow) {
        setPending(prompt.id);
        const result = await setPromptActive({ promptId: prompt.id, isActive: !prompt.isActive });
        setPending(null);
        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        toast.success(
            prompt.isActive
                ? "Prompt paused. It will not run again until re-enabled."
                : `Prompt active. It will run on ${runnableEngineCount} engine${runnableEngineCount === 1 ? "" : "s"} at the next scheduled slot.`
        );
    }

    async function remove(prompt: PromptRow) {
        setPending(prompt.id);
        const result = await deletePrompt({ promptId: prompt.id });
        setPending(null);
        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        toast.success("Prompt deleted. Past results are kept.");
    }

    if (prompts.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No prompts yet. Add the questions a customer would actually ask an AI assistant
                when looking for a business like yours.
            </p>
        );
    }

    return (
        <ul className="divide-y">
            {prompts.map((prompt) => (
                <li key={prompt.id} className="flex items-start gap-4 py-4">
                    <Switch
                        checked={prompt.isActive}
                        disabled={pending === prompt.id}
                        onCheckedChange={() => toggle(prompt)}
                        aria-label={prompt.isActive ? "Pause prompt" : "Activate prompt"}
                    />

                    <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium">{prompt.promptText}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {prompt.intent ? (
                                <Badge variant="secondary" className="text-xs">
                                    {prompt.intent}
                                </Badge>
                            ) : null}
                            {prompt.localeCity ? (
                                <Badge variant="outline" className="text-xs">
                                    {prompt.localeCity}
                                </Badge>
                            ) : null}
                            <span className="text-xs text-muted-foreground">
                                {/*
                                  * "not sampled yet" rather than "0 results".
                                  * A prompt that has never run has NO data; a zero
                                  * would read as "we looked and found nothing".
                                  */}
                                {prompt.sampleCount === 0
                                    ? "Not sampled yet"
                                    : `${prompt.sampleCount} observation${prompt.sampleCount === 1 ? "" : "s"}`}
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending === prompt.id}
                        onClick={() => remove(prompt)}
                        aria-label="Delete prompt"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </li>
            ))}
        </ul>
    );
}
