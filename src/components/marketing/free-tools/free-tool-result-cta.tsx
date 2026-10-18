import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";

/** Trial CTA shown after a free tool has produced a result. */
export function FreeToolResultCta({ toolSlug, message }: { toolSlug: string; message: string }) {
    const separator = SIGNUP_URL.includes("?") ? "&" : "?";
    const href = `${SIGNUP_URL}${separator}ref=${encodeURIComponent(toolSlug)}`;
    return (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center space-y-3">
            <p className="text-sm text-foreground">{message}</p>
            <Button asChild>
                <Link href={href} data-track="trial" data-track-location={`tool-result-${toolSlug}`}>
                    Start 7-day free trial
                </Link>
            </Button>
        </div>
    );
}
