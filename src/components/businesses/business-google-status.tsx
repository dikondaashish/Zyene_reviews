import { ReviewPlatformIcon } from "@/components/reviews/review-platform";
import type { GoogleConnectionStatus } from "@/lib/google/is-google-connected";

export function BusinessGoogleStatus({ status }: { status: GoogleConnectionStatus }) {
    const connected = status === "connected";
    return (
        <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background"><ReviewPlatformIcon platform="google" className="size-4" /></span>
            <div>
                <p className="text-xs font-medium">Google</p>
                <p className={`mt-1 flex items-center gap-1.5 text-xs ${connected ? "text-success" : "text-muted-foreground"}`}>
                    <span className={`size-1.5 rounded-full ${connected ? "bg-success" : "bg-warning"}`} aria-hidden="true" />
                    {connected ? "Connected" : status === "needs_reconnect" ? "Reconnect needed" : "Not connected"}
                </p>
            </div>
        </div>
    );
}
