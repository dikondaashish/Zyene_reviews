import { AlertTriangle, ExternalLink } from "lucide-react";

export function NeedsAttentionYelpReplyNotice() {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-chart-4/35 bg-chart-4/10 px-3 py-2.5 text-xs text-warning-foreground">
            <AlertTriangle className="mt-0.5 shrink-0 size-3.5" aria-hidden />
            <span>
                Replies to Yelp reviews must be made on{" "}
                <a
                    href="https://biz.yelp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium underline hover:text-warning-foreground"
                >
                    yelp.com
                    <ExternalLink className="size-3" aria-hidden />
                </a>
                .
            </span>
        </div>
    );
}
