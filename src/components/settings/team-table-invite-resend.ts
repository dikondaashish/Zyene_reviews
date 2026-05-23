import { toast } from "sonner";

export async function teamTableResendInviteWithToasts(inviteId: string) {
    const response = await fetch(`/api/team/invites/${inviteId}/resend`, { method: "POST" });
    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        throw new Error("Invalid response from server");
    }
    if (!response.ok) {
        const err =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof (payload as { error: unknown }).error === "string"
                ? (payload as { error: string }).error
                : "Failed to resend invite email";
        throw new Error(err);
    }
    const data =
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        typeof (payload as { data: unknown }).data === "object" &&
        (payload as { data: unknown }).data !== null
            ? (payload as { data: Record<string, unknown> }).data
            : null;

    const link = typeof data?.invite_link === "string" ? data.invite_link : null;
    const copyLink = () => {
        if (link && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(link);
        }
    };

    if (data?.email_delivered === false) {
        toast.warning("Invite expiry was renewed, but email was not sent from our server.", {
            description: typeof data.email_delivery_error === "string" ? data.email_delivery_error : undefined,
            duration: 12_000,
            action: link ? { label: "Copy invite link", onClick: copyLink } : undefined,
        });
        if (link) copyLink();
    } else if (data?.email_delivered === true) {
        toast.success("Invitation email sent again.", {
            description:
                "If they still do not see it, ask them to check spam. You can copy the link as a backup.",
            duration: 10_000,
            action: link ? { label: "Copy invite link", onClick: copyLink } : undefined,
        });
    } else {
        toast.message("Resend finished", {
            description: "We could not confirm email delivery. Use Copy invite link if needed.",
            duration: 9000,
            action: link ? { label: "Copy invite link", onClick: copyLink } : undefined,
        });
    }
}
