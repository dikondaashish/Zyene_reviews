import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";

export function NeedsAttentionDraftGeneratingState({ copy }: { copy: NeedsAttentionCopy }) {
    return (
        <div className="flex justify-center py-3">
            <Button type="button" disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {copy.drafting}
            </Button>
        </div>
    );
}
