"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, LineChart } from "lucide-react";

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
            toast.error(result.error, result.upgradeHref ? {
                action: {
                    label: "Upgrade",
                    onClick: () => window.location.assign(result.upgradeHref as string),
                },
            } : undefined);
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
                when looking for a business like yours, or generate a starting set from your
                Google category.
            </p>
        );
    }

    // F4.3: grouped by cluster, with ungrouped prompts last so a manually typed
    // prompt is never hidden above a fold of generated ones.
    const groups = new Map<string, PromptRow[]>();
    for (const prompt of prompts) {
        const key = prompt.clusterName ?? UNGROUPED;
        const bucket = groups.get(key);
        if (bucket) bucket.push(prompt);
        else groups.set(key, [prompt]);
    }
    const ordered = [...groups.entries()].sort(([a], [b]) =>
        a === UNGROUPED ? 1 : b === UNGROUPED ? -1 : a.localeCompare(b)
    );

    return (
        <div className="space-y-6">
            {ordered.map(([clusterName, rows]) => (
                <section key={clusterName}>
                    {groups.size > 1 ? (
                        <h3 className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                            {clusterName}
                            <span className="ml-2 font-normal normal-case">
                                {rows.filter((r) => r.isActive).length} of {rows.length} active
                            </span>
                        </h3>
                    ) : null}
                    <PromptRows
                        rows={rows}
                        pending={pending}
                        onToggle={toggle}
                        onRemove={remove}
                    />
                </section>
            ))}
        </div>
    );
}

const UNGROUPED = "Ungrouped";

function PromptRows({
    rows,
    pending,
    onToggle,
    onRemove,
}: {
    rows: PromptRow[];
    pending: string | null;
    onToggle: (prompt: PromptRow) => void;
    onRemove: (prompt: PromptRow) => void;
}) {
    return (
        <ul className="divide-y">
            {rows.map((prompt) => (
                <li key={prompt.id} className="flex items-start gap-4 py-4">
                    <Switch
                        checked={prompt.isActive}
                        disabled={pending === prompt.id}
                        onCheckedChange={() => onToggle(prompt)}
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

                    {prompt.sampleCount > 0 ? (
                        <Button variant="ghost" size="sm" asChild aria-label="View trend and head-to-head">
                            <Link href={`/google-seo-aeo/prompts/${prompt.id}`}>
                                <LineChart className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending === prompt.id}
                        onClick={() => onRemove(prompt)}
                        aria-label="Delete prompt"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </li>
            ))}
        </ul>
    );
}
