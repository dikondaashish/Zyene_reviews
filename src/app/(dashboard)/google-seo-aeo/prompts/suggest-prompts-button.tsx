"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateSuggestedPrompts } from "./suggest-prompts-action";

/**
 * F4.2 — fills the library from the business's Google category and city.
 *
 * Says "inactive" on the button's own result message, not just in help text:
 * the one thing a user needs to know before clicking is that this cannot start
 * spending money.
 */
export function SuggestPromptsButton({ businessId }: { businessId: string }) {
    const [pending, setPending] = React.useState(false);

    async function run() {
        setPending(true);
        const result = await generateSuggestedPrompts({ businessId });
        setPending(false);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        if (result.inserted === 0) {
            toast.info(
                result.skipped > 0
                    ? "No new suggestions — your library already covers them."
                    : "No suggestions could be generated."
            );
            return;
        }
        toast.success(
            `Added ${result.inserted} suggested prompt${result.inserted === 1 ? "" : "s"}, all inactive. Switch on the ones worth tracking.`
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={run} disabled={pending}>
            <Sparkles className="mr-2 size-4" />
            {pending ? "Generating…" : "Suggest prompts"}
        </Button>
    );
}
