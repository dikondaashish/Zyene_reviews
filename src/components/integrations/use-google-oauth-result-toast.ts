"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const GOOGLE_OAUTH_ERROR_MESSAGES: Record<string, string> = {
    account_mismatch: "That Google account can't access this business's connected location. Reconnect with the account that manages it.",
    denied: "Google connection was canceled.",
    invalid_state: "Google connection expired or was started elsewhere. Please try again.",
    no_refresh_token: "Google did not grant offline access. Please try connecting again.",
    unavailable: "Google connection is unavailable right now.",
};

/** Surfaces the outcome of /api/integrations/google/callback on the Integrations page. */
export function useGoogleOAuthResultToast() {
    const searchParams = useSearchParams();
    useEffect(() => {
        const result = searchParams.get("google");
        if (result === "connected") toast.success("Google connected");
        if (result === "search_console") toast.success("Search Console connected");
        const error = searchParams.get("google_error");
        if (error) toast.error(GOOGLE_OAUTH_ERROR_MESSAGES[error] ?? "Google connection failed. Please try again.");
    }, [searchParams]);
}
