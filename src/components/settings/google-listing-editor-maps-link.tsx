import { ExternalLink } from "lucide-react";

import type { GoogleListingMeta } from "./google-listing-editor-types";

export function GoogleListingEditorMapsLink({ meta }: { meta: GoogleListingMeta }) {
    if (!meta.mapsUri) return null;

    return (
        <p className="text-sm">
            <a
                href={meta.mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
                View on Google Maps
                <ExternalLink className="size-3.5" />
            </a>
            {meta.primaryCategoryDisplay && (
                <span className="text-muted-foreground"> · {meta.primaryCategoryDisplay}</span>
            )}
        </p>
    );
}
