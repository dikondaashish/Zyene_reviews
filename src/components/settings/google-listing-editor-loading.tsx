import { Loader2 } from "lucide-react";

export function GoogleListingEditorLoading() {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="animate-spin size-4" />
            Loading listing from Google…
        </div>
    );
}
