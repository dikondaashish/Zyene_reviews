import { AlertTriangle, ExternalLink } from "lucide-react";

export function NeedsAttentionYelpReplyNotice() {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-chart-4/35 bg-chart-4/10 px-3 py-2.5 text-xs text-chart-4">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
                Replies to Yelp reviews must be made on{" "}
                <a
                    href="https://biz.yelp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium underline hover:text-chart-4"
                >
                    yelp.com
                    <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
                .
            </span>
        </div>
    );
}
