/** Supabase Auth limits how many confirmation / reset / OTP emails it sends per hour (built-in SMTP). */
export function isSupabaseEmailSendRateLimited(error: { message?: string } | null | undefined): boolean {
    const msg = (error?.message ?? "").toLowerCase();
    return (
        msg.includes("email rate limit") ||
        msg.includes("over_email_send_rate_limit") ||
        msg.includes("too many emails")
    );
}

export function toastAuthEmailRateLimit(toast: {
    error: (title: string, opts?: { description?: string }) => void;
}): void {
    toast.error("Too many auth emails right now", {
        description:
            "Please wait 15–60 minutes before requesting another link, or use Sign in with Google. " +
            "To raise limits permanently, set custom SMTP in the Supabase dashboard (Authentication → Emails).",
    });
}
